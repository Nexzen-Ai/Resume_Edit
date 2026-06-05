import hashlib
import json
import re
import time
import litellm
from database import supabase
from config import settings

_SYSTEM_PROMPT = """You are an expert resume editor. Identify relevant content to ADD to a resume based on a job description the candidate is targeting.
Rules:
- DO NOT restructure/reformat/rewrite. DO NOT change section names or order.
- Only add skills, keywords, and bullets RELEVANT to the candidate's existing roles and the JD.
- Stay grounded: never invent employers, job titles, dates, degrees, or metrics not implied by the resume.
- New bullets must plausibly fit the existing role they attach to.
Summary (important):
- Rewrite "updated_summary" as a strong 4-6 sentence professional summary (~450-650 characters).
- Weave in the JD's key skills, tools, and ATS keywords naturally.
- Include 2-3 quantified achievements, but use ONLY metrics/percentages that already appear in the resume — do not invent numbers.
- Mention notable certifications/platforms if present in the resume. Professional tone, no first person.
Experience (important):
- For EACH company in the resume's experience section, add up to 2 new bullets that include JD keywords and a realistic action + result.
- You MUST add at least one new bullet to at least 2 DIFFERENT organizations.
- "company" and "title" must copy the resume text closely so they can be matched.
Skills quality (important):
- Add ONLY concrete technologies, tools, languages, frameworks, or platforms. NO vague phrases like "efficient solutions", "automation strategies", "project requirements", "collaboration".
- Skip anything ALREADY present in the resume — only genuinely missing items.
- Provide AT LEAST 20 skills (include closely-related tools commonly paired with the JD's stack, only if they plausibly fit the candidate's experience).
- For each skill group, set "category" to EXACTLY one of the category labels that already exist in the resume's Technical Skills section (copy the text before the colon).
- Put each skill under its TRUE category: e.g. a frontend framework (Vue, Typescript) under Programming/Frameworks, a datastore under Databases, a cloud/devops tool under Cloud/Infrastructure. Never place a skill under a category it does not belong to.
Keywords (important):
- Provide AT LEAST 30 ATS keywords/phrases from the JD.
- Keywords MUST be DIFFERENT from the skills list — do not just repeat the tools. Include role titles, methodologies, responsibilities, domain terms, certifications, and multi-word phrases from the JD.
Return only valid JSON — no markdown, no explanation."""

_SCHEMA_FULL = """{
  "updated_summary": "strong 4-6 sentence summary (~450-650 chars) with JD keywords, key skills, and 2-3 real metrics from the resume",
  "skills_to_add": [
    {"category": "name of the EXISTING resume skills category this best fits (e.g. 'Cloud & Infrastructure')", "skills": ["20+ concrete tools/tech from the JD, missing from the resume"]}
  ],
  "experience_enhancements": [
    {"company": "exact company name", "title": "exact title", "new_bullets": ["max 2 bullets per job"]}
  ],
  "keywords_added": ["30+ ATS keywords/phrases from the JD, DIFFERENT from the skills list (role titles, methodologies, domain terms, certifications, phrases)"]
}"""

_SCHEMA_SHORT = """{
  "updated_summary": "strong 4-6 sentence summary (~450-650 chars) with JD keywords, key skills, and 2-3 real metrics from the resume",
  "skills_to_add": [
    {"category": "name of the EXISTING resume skills category this best fits", "skills": ["20+ concrete tools/tech from the JD, missing from the resume"]}
  ],
  "keywords_added": ["30+ ATS keywords/phrases from the JD, DIFFERENT from the skills list (role titles, methodologies, domain terms, certifications, phrases)"]
}"""


def _cache_key(resume_trimmed: str, jd_trimmed: str) -> str:
    return hashlib.sha256(f"{resume_trimmed}||{jd_trimmed}".encode()).hexdigest()


def _get_cached(key: str):
    try:
        result = supabase.table("llm_cache").select("result").eq("cache_key", key).execute()
        if result.data:
            return result.data[0]["result"]
    except Exception:
        pass
    return None


def _set_cached(key: str, result: dict) -> None:
    try:
        supabase.table("llm_cache").upsert({"cache_key": key, "result": result}).execute()
    except Exception:
        pass


def analyze_and_edit_resume(resume_text: str, job_description: str,
                            priority_keywords: list = None, selected_skills: list = None) -> dict:
    # resume_text already stripped at upload time — just trim length
    jd_trimmed = job_description[:6000]
    resume_trimmed = resume_text[:3000]
    priority_keywords = priority_keywords or []
    selected_skills = selected_skills or []

    # Selections are part of the cache key so different choices re-run.
    sel_sig = ",".join(sorted(priority_keywords)) + "|" + ",".join(sorted(selected_skills))
    key = _cache_key(resume_trimmed, jd_trimmed + "||" + sel_sig)
    cached = _get_cached(key)
    if cached:
        print("[LLM] Cache hit — skipping API call")
        return cached

    short_resume = len(resume_trimmed) < 500
    schema = _SCHEMA_SHORT if short_resume else _SCHEMA_FULL

    priority_block = ""
    if priority_keywords:
        priority_block = (
            "\nPRIORITY KEYWORDS (must-include — weave EVERY one into the summary, "
            "add as skills under the right category, and reference in experience bullets):\n"
            + ", ".join(priority_keywords[:40])
            + "\n"
        )

    skills_block = ""
    if selected_skills:
        skills_block = (
            "\nSKILLS TO ADD (use EXACTLY these — do not add others; categorize each "
            "under the correct existing resume category):\n"
            + ", ".join(selected_skills[:40])
            + "\n"
        )

    prompt = f"""JD:
{jd_trimmed}
{priority_block}{skills_block}
RESUME:
{resume_trimmed}

Return JSON matching this schema exactly:
{schema}
company/title must exactly match resume text."""

    for attempt in range(3):
        try:
            response = litellm.completion(
                model=settings.llm_model,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1600,
                temperature=0.3,
                api_key=settings.llm_api_key,
                timeout=60,
            )
            raw = response.choices[0].message.content.strip()
            match = re.search(r"\{[\s\S]*\}", raw)
            if not match:
                raise ValueError("LLM returned no JSON block")
            result = json.loads(match.group())
            result.setdefault("experience_enhancements", [])
            # Flatten categorized skills into a flat list for history/storage.
            skills = result.get("skills_to_add", [])
            if skills and isinstance(skills[0], dict):
                result["added_skills"] = [s for g in skills for s in g.get("skills", [])]
            else:
                result["added_skills"] = skills
            # Keywords must differ from skills — drop exact overlaps for history.
            skills_lower = {s.lower() for s in result["added_skills"]}
            result["keywords_added"] = [
                k for k in result.get("keywords_added", []) if k and k.lower() not in skills_lower
            ]
            _set_cached(key, result)
            return result
        except litellm.Timeout:
            raise ValueError("AI took too long to respond (>60s). Try again.")
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                wait = 15 * (attempt + 1)
                print(f"[LLM] Rate limited, retrying in {wait}s...")
                time.sleep(wait)
                continue
            raise


_VISION_PROMPT = """You are reading screenshots of a job description.
Extract ALL readable text, then identify the most important keywords for resume tailoring.
Focus on: technologies, tools, languages, frameworks, platforms, methodologies, role titles, and required skills.
Ignore boilerplate (equal-opportunity statements, benefits, legal/EEO text, veteran/disability forms).
Return ONLY valid JSON, no markdown:
{"jd_text": "the full extracted job-description text", "keywords": ["ordered by importance, most relevant first"]}"""


def extract_jd_from_images(images: list) -> dict:
    """Read JD screenshots with a vision model. Returns {jd_text, keywords}.

    images: list of data-URL base64 strings (e.g. 'data:image/png;base64,...').
    """
    content = [{"type": "text", "text": "Extract the job description and keywords from these screenshots."}]
    for img in images[:5]:
        content.append({"type": "image_url", "image_url": {"url": img}})

    for attempt in range(3):
        try:
            response = litellm.completion(
                model=settings.vision_model,
                messages=[
                    {"role": "system", "content": _VISION_PROMPT},
                    {"role": "user", "content": content},
                ],
                max_tokens=2000,
                temperature=0.2,
                api_key=settings.llm_api_key,
                timeout=90,
            )
            raw = response.choices[0].message.content.strip()
            match = re.search(r"\{[\s\S]*\}", raw)
            if not match:
                raise ValueError("Vision model returned no JSON block")
            data = json.loads(match.group())
            jd_text = (data.get("jd_text") or "").strip()
            keywords = [k.strip() for k in data.get("keywords", []) if k and k.strip()]
            # De-dup keywords, preserve order.
            seen, deduped = set(), []
            for k in keywords:
                if k.lower() not in seen:
                    seen.add(k.lower())
                    deduped.append(k)
            return {"jd_text": jd_text, "keywords": deduped}
        except litellm.Timeout:
            raise ValueError("Reading the screenshots took too long. Try fewer/smaller images.")
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                time.sleep(15 * (attempt + 1))
                continue
            raise


_ANALYZE_PROMPT = """You extract resume-tailoring terms from a JOB DESCRIPTION.
CRITICAL: the only SOURCE of terms is the JOB DESCRIPTION text. The RESUME is provided ONLY so you can skip skills the candidate already lists. NEVER take any term from the resume — not its skills, not its job titles, not its past roles or domains. If a term is not written in the job description, do not output it.
Return TWO lists as JSON, nothing else:
1. "will_add_skills": concrete skills/tools/technologies/methodologies that ACTUALLY APPEAR in the JOB DESCRIPTION text (tools, languages, frameworks, platforms, and technical practices like "Infrastructure as Code", "Configuration Management", "CI/CD", "Containerization", "Orchestration", "Monitoring", "Troubleshooting"). Aim for up to 20, but only terms truly present in the JD. Skip EXACT duplicates already in the resume. Never invent tools and never borrow from the resume's other domains.
2. "optional_terms": role titles, disciplines, methodologies, and ATS phrases that appear in the JOB DESCRIPTION (at least 15 if present). Must come from the JD wording — never from the resume's job titles or skills.
Return ONLY: {"will_add_skills": [...], "optional_terms": [...]}"""


def analyze_jd_preview(resume_text: str, job_description: str) -> dict:
    """Preview what a tailor would add: concrete missing skills (Block A) and
    optional role/discipline terms (Block B, >=15). Returns both lists."""
    jd_trimmed = job_description[:6000]
    resume_trimmed = resume_text[:3000]

    prompt = (
        f"JOB DESCRIPTION (the ONLY source of terms):\n{jd_trimmed}\n\n"
        f"RESUME (use ONLY to skip already-present skills — do NOT take any term from here):\n{resume_trimmed}\n\n"
        "Return the two JSON lists, extracting strictly from the job description."
    )

    for attempt in range(3):
        try:
            response = litellm.completion(
                model=settings.llm_model,
                messages=[
                    {"role": "system", "content": _ANALYZE_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=900,
                temperature=0.2,
                api_key=settings.llm_api_key,
                timeout=60,
            )
            raw = response.choices[0].message.content.strip()
            match = re.search(r"\{[\s\S]*\}", raw)
            if not match:
                raise ValueError("Analyzer returned no JSON block")
            data = json.loads(match.group())

            def _clean(items):
                seen, out = set(), []
                for s in items or []:
                    s = (s or "").strip()
                    if s and s.lower() not in seen:
                        seen.add(s.lower())
                        out.append(s)
                return out

            skills = _clean(data.get("will_add_skills"))
            # Optional terms must not duplicate the skills list.
            skills_lower = {s.lower() for s in skills}
            optional = [t for t in _clean(data.get("optional_terms")) if t.lower() not in skills_lower]
            return {"will_add_skills": skills, "optional_terms": optional}
        except litellm.Timeout:
            raise ValueError("Analysis took too long. Try again.")
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                time.sleep(15 * (attempt + 1))
                continue
            raise
