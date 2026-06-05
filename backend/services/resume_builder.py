import io
import copy
from docx import Document
from docx.oxml.ns import qn
from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def _para_text(para) -> str:
    return para.text.strip()


def _get_all_paragraphs(doc):
    """Return all paragraphs in document order, including table cells."""
    from docx.text.paragraph import Paragraph
    result = []

    def _collect(element):
        for child in element:
            tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
            if tag == "p":
                result.append(Paragraph(child, doc))
            elif tag in ("tbl", "tc", "tr"):
                _collect(child)

    _collect(doc.element.body)
    return result


def _is_section_heading(para) -> bool:
    text = _para_text(para)
    if not text or len(text) < 2:
        return False
    return text.upper() == text and len(text.split()) <= 6


def _find_section(paragraphs, *names):
    """Return index of section heading matching any of the given names."""
    for i, p in enumerate(paragraphs):
        t = _para_text(p).upper()
        for name in names:
            if name.upper() in t:
                return i
    return None


def _section_content_range(paragraphs, heading_idx):
    """Return (start, end) indices of content paragraphs within a section."""
    start = heading_idx + 1
    for i in range(start, len(paragraphs)):
        if _para_text(paragraphs[i]) and _is_section_heading(paragraphs[i]):
            return start, i
    return start, len(paragraphs)


def _insert_para_after(ref_para, text: str):
    """Insert a new paragraph after ref_para, copying its run format."""
    new_p = copy.deepcopy(ref_para._element)

    # Remove all runs from copy
    for r in new_p.findall(f"{{{W}}}r"):
        new_p.remove(r)
    for r in new_p.findall(f".//{{{W}}}r"):
        parent = r.getparent()
        if parent is not None:
            parent.remove(r)

    # Copy rPr from first run of reference if available
    ref_runs = ref_para._element.findall(f"{{{W}}}r")
    rpr_elem = None
    if ref_runs:
        existing_rpr = ref_runs[0].find(f"{{{W}}}rPr")
        if existing_rpr is not None:
            rpr_elem = copy.deepcopy(existing_rpr)

    # Build new run
    r_elem = etree.SubElement(new_p, f"{{{W}}}r")
    if rpr_elem is not None:
        r_elem.insert(0, rpr_elem)
    t_elem = etree.SubElement(r_elem, f"{{{W}}}t")
    t_elem.text = text
    t_elem.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")

    ref_para._element.addnext(new_p)


def _update_summary(paragraphs, new_text: str) -> bool:
    """Replace profile summary paragraph text. Returns True if applied."""
    heading_idx = _find_section(paragraphs, "PROFILE SUMMARY", "SUMMARY", "PROFESSIONAL SUMMARY")
    if heading_idx is None:
        return False

    start, end = _section_content_range(paragraphs, heading_idx)
    for i in range(start, end):
        p = paragraphs[i]
        if _para_text(p):
            # Clear all runs and set new text in first run
            runs = p.runs
            if runs:
                runs[0].text = new_text
                for run in runs[1:]:
                    run.text = ""
            else:
                p.add_run(new_text)
            return True
    return False


def _add_skills(paragraphs, skills: list) -> bool:
    """Append new skills directly to the last bullet in Technical Skills section. Returns True if applied."""
    if not skills:
        return False

    heading_idx = _find_section(paragraphs, "TECHNICAL SKILLS", "SKILLS")
    if heading_idx is None:
        return False

    start, end = _section_content_range(paragraphs, heading_idx)

    # Find last non-empty paragraph in skills section
    last_para = None
    for i in range(end - 1, start - 1, -1):
        if _para_text(paragraphs[i]):
            last_para = paragraphs[i]
            break

    if last_para is None:
        return False

    # Append skills inline to the last skill bullet
    runs = last_para.runs
    appended = ", ".join(skills)
    if runs:
        runs[-1].text = runs[-1].text.rstrip() + ", " + appended
    else:
        last_para.add_run(", " + appended)
    return True


def _add_experience_bullets(paragraphs, enhancements: list) -> int:
    """Add new bullet points to specified jobs in experience section. Returns count of jobs enhanced."""
    if not enhancements:
        return 0

    exp_heading_idx = _find_section(paragraphs, "PROFESSIONAL EXPERIENCE", "WORK EXPERIENCE", "EXPERIENCE")
    if exp_heading_idx is None:
        return 0

    exp_start, exp_end = _section_content_range(paragraphs, exp_heading_idx)
    exp_paras = paragraphs[exp_start:exp_end]

    applied = 0
    for enh in enhancements:
        company = enh.get("company", "").lower()
        new_bullets = enh.get("new_bullets", [])
        if not company or not new_bullets:
            continue

        # Find the paragraph containing the company name
        job_para_idx = None
        for i, p in enumerate(exp_paras):
            if company in _para_text(p).lower():
                job_para_idx = i
                break

        if job_para_idx is None:
            continue

        # Find last bullet paragraph for this job
        # (stop at next job heading: bold paragraph with no bullet)
        last_bullet_para = None
        for i in range(job_para_idx + 1, len(exp_paras)):
            p = exp_paras[i]
            text = _para_text(p)
            if not text:
                continue
            # Next job title: check if it looks like "Title | Company   Date"
            if "|" in text and not text.startswith("●") and not text.startswith("•"):
                break
            if text.startswith("●") or text.startswith("•") or p.style.name.startswith("List"):
                last_bullet_para = p

        if last_bullet_para is None:
            # Use job title para itself as anchor
            last_bullet_para = exp_paras[job_para_idx]

        # Insert new bullets after last existing bullet
        for bullet_text in reversed(new_bullets):
            _insert_para_after(last_bullet_para, f"● {bullet_text}")
        applied += 1

    return applied


def apply_edits_to_docx(original_bytes: bytes, edits: dict) -> tuple[bytes, dict]:
    """Apply AI-suggested edits to original DOCX preserving full structure.

    Returns (docx_bytes, report). report has booleans/counts so callers can
    detect when section heuristics failed to match anything (silent no-op).
    """
    doc = Document(io.BytesIO(original_bytes))
    paragraphs = _get_all_paragraphs(doc)

    report = {"summary_updated": False, "skills_added": False, "jobs_enhanced": 0}

    if edits.get("updated_summary"):
        report["summary_updated"] = _update_summary(paragraphs, edits["updated_summary"])

    if edits.get("skills_to_add"):
        report["skills_added"] = _add_skills(paragraphs, edits["skills_to_add"])

    if edits.get("experience_enhancements"):
        report["jobs_enhanced"] = _add_experience_bullets(paragraphs, edits["experience_enhancements"])

    report["any_applied"] = (
        report["summary_updated"] or report["skills_added"] or report["jobs_enhanced"] > 0
    )

    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.read(), report
