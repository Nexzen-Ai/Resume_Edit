import io
from docx import Document
from services.resume_builder import apply_edits_to_docx, _get_all_paragraphs


def _make_docx(lines: list[str]) -> bytes:
    doc = Document()
    for line in lines:
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def _all_text(docx_bytes: bytes) -> str:
    doc = Document(io.BytesIO(docx_bytes))
    return "\n".join(p.text for p in _get_all_paragraphs(doc))


_RESUME = [
    "PROFESSIONAL SUMMARY",
    "Experienced engineer.",
    "TECHNICAL SKILLS",
    "Python, SQL",
    "PROFESSIONAL EXPERIENCE",
    "Engineer | Acme Corp   2020-2022",
    "● Built internal tools",
]

_EDITS = {
    "updated_summary": "Senior engineer fluent in Kubernetes and Docker.",
    "skills_to_add": ["Kubernetes", "Docker"],
    "experience_enhancements": [
        {"company": "Acme Corp", "title": "Engineer", "new_bullets": ["Shipped feature X", "Owned service Y"]}
    ],
}


def test_all_sections_applied():
    out, report = apply_edits_to_docx(_make_docx(_RESUME), _EDITS)
    assert report["any_applied"] is True
    assert report["summary_updated"] is True
    assert report["skills_added"] is True
    assert report["jobs_enhanced"] == 1

    text = _all_text(out)
    assert "Senior engineer fluent in Kubernetes" in text
    assert "Kubernetes" in text and "Docker" in text
    assert "Shipped feature X" in text
    assert "Owned service Y" in text


def test_original_skills_preserved():
    out, _ = apply_edits_to_docx(_make_docx(_RESUME), _EDITS)
    assert "Python, SQL" in _all_text(out)


def test_unrecognized_format_reports_no_op():
    # No standard headings -> heuristics match nothing -> any_applied False.
    junk = _make_docx(["my resume", "i did stuff", "at a place"])
    out, report = apply_edits_to_docx(junk, _EDITS)
    assert report["any_applied"] is False
    assert report["jobs_enhanced"] == 0


def test_empty_edits_is_no_op():
    out, report = apply_edits_to_docx(_make_docx(_RESUME), {})
    assert report["any_applied"] is False
