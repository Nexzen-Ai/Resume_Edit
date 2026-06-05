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
- Skip anything ALREADY present in the resume — only genuinely missing items. Prefer real skills over padding.
- For each skill group, set "category" to EXACTLY one of the category labels that already exist in the resume's Technical Skills section (copy the text before the colon).
- Put each skill under its TRUE category: e.g. a frontend framework (Vue, Typescript) under Programming/Frameworks, a datastore under Databases, a cloud/devops tool under Cloud/Infrastructure. Never place a skill under a category it does not belong to.
Keywords (important):
- Provide AT LEAST 25 ATS keywords/phrases from the JD.
- Keywords MUST be DIFFERENT from the skills list — do not just repeat the tools. Include role titles, methodologies, responsibilities, domain terms, certifications, and multi-word phrases from the JD.
Return only valid JSON — no markdown, no explanation."""

_SCHEMA_FULL = """{
  "updated_summary": "strong 4-6 sentence summary (~450-650 chars) with JD keywords, key skills, and 2-3 real metrics from the resume",
  "skills_to_add": [
    {"category": "name of the EXISTING resume skills category this best fits (e.g. 'Cloud & Infrastructure')", "skills": ["concrete tool/tech from the JD, missing from the resume"]}
  ],
  "experience_enhancements": [
    {"company": "exact company name", "title": "exact title", "new_bullets": ["max 2 bullets per job"]}
  ],
  "keywords_added": ["25+ ATS keywords/phrases from the JD, DIFFERENT from the skills list (role titles, methodologies, domain terms, certifications, phrases)"]
}"""

_SCHEMA_SHORT = """{
  "updated_summary": "strong 4-6 sentence summary (~450-650 chars) with JD keywords, key skills, and 2-3 real metrics from the resume",
  "skills_to_add": [
    {"category": "name of the EXISTING resume skills category this best fits", "skills": ["concrete tool/tech from the JD, missing from the resume"]}
  ],
  "keywords_added": ["25+ ATS keywords/phrases from the JD, DIFFERENT from the skills list (role titles, methodologies, domain terms, certifications, phrases)"]
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


def analyze_and_edit_resume(resume_text: str, job_description: str) -> dict:
    # resume_text already stripped at upload time — just trim length
    jd_trimmed = job_description[:3000]
    resume_trimmed = resume_text[:3000]

    key = _cache_key(resume_trimmed, jd_trimmed)
    cached = _get_cached(key)
    if cached:
        print("[LLM] Cache hit — skipping API call")
        return cached

    short_resume = len(resume_trimmed) < 500
    schema = _SCHEMA_SHORT if short_resume else _SCHEMA_FULL

    prompt = f"""JD:
{jd_trimmed}

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
