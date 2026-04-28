import json
import re
import time
import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.gemini_api_key)

_PREFERRED_MODELS = [
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-flash-latest",
]


def _pick_model() -> str:
    try:
        available = [m.name.replace("models/", "") for m in genai.list_models()
                     if "generateContent" in m.supported_generation_methods]
        for preferred in _PREFERRED_MODELS:
            if preferred in available:
                print(f"[Gemini] Using model: {preferred}")
                return preferred
        fallback = available[0] if available else "gemini-2.0-flash"
        print(f"[Gemini] Fallback model: {fallback}")
        return fallback
    except Exception as e:
        print(f"[Gemini] Model list failed ({e}), defaulting to gemini-2.0-flash")
        return "gemini-2.0-flash"


_MODEL_NAME = _pick_model()

model = genai.GenerativeModel(
    model_name=_MODEL_NAME,
    system_instruction="""You are an expert resume editor.
Your ONLY job is to identify what to ADD to an existing resume based on a job description.
DO NOT restructure, reformat, or rewrite the resume.
DO NOT change section names or order.
Only return JSON with minimal targeted additions.
Return only valid JSON — no markdown, no explanation.""",
)


def analyze_and_edit_resume(resume_text: str, job_description: str) -> dict:
    # Trim inputs to reduce tokens — JD capped at 1500 chars, resume at 2000
    jd_trimmed = job_description[:1500]
    resume_trimmed = resume_text[:2000]

    prompt = f"""JD:
{jd_trimmed}

RESUME:
{resume_trimmed}

Return JSON only:
{{
  "updated_summary": "rewritten summary with JD keywords, same length",
  "skills_to_add": ["max 10 skills from JD missing in resume"],
  "experience_enhancements": [
    {{"company": "exact company name", "title": "exact title", "new_bullets": ["1 bullet max per job"]}}
  ],
  "added_skills": ["same as skills_to_add"],
  "keywords_added": ["top 10 keywords added"]
}}
Rules: skills_to_add max 10, 2 bullet per job, company/title exact match from resume, no fabrication."""

    for attempt in range(3):
        try:
            response = model.generate_content(
                prompt,
                generation_config={"max_output_tokens": 1024, "temperature": 0.3},
            )
            raw = response.text.strip()
            match = re.search(r"\{[\s\S]*\}", raw)
            if not match:
                raise ValueError("Gemini returned no JSON block")
            return json.loads(match.group())
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                wait = 15 * (attempt + 1)
                print(f"[Gemini] Rate limited, retrying in {wait}s...")
                time.sleep(wait)
                continue
            raise
