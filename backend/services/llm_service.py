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
Return only valid JSON — no markdown, no explanation."""

_SCHEMA_FULL = """{
  "updated_summary": "rewritten summary with JD keywords, same length",
  "skills_to_add": ["max 15 skills from JD missing in resume"],
  "experience_enhancements": [
    {"company": "exact company name", "title": "exact title", "new_bullets": ["max 2 bullets per job"]}
  ],
  "keywords_added": ["top 15 keywords added"]
}"""

_SCHEMA_SHORT = """{
  "updated_summary": "rewritten summary with JD keywords, same length",
  "skills_to_add": ["max 15 skills from JD missing in resume"],
  "keywords_added": ["top 15 keywords added"]
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
    jd_trimmed = job_description[:2000]
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
                max_tokens=1000,
                temperature=0.3,
                api_key=settings.llm_api_key,
                timeout=60,
            )
            raw = response.choices[0].message.content.strip()
            match = re.search(r"\{[\s\S]*\}", raw)
            if not match:
                raise ValueError("LLM returned no JSON block")
            result = json.loads(match.group())
            result.setdefault("added_skills", result.get("skills_to_add", []))
            result.setdefault("experience_enhancements", [])
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
