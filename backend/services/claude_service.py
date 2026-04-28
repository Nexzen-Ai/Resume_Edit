import anthropic
from config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """You are an expert resume writer and ATS optimization specialist.
Your job is to tailor resumes to specific job descriptions.
You must preserve the candidate's original experience, education, and achievements.
Only add relevant skills and enhance bullet points with keywords from the JD.
Never fabricate experience or achievements. Only rephrase or add JD-relevant keywords naturally.
Return only valid JSON — no markdown, no explanation."""


def analyze_and_edit_resume(resume_text: str, job_description: str) -> dict:
    prompt = f"""Analyze this job description and resume, then return an edited resume as JSON.

JOB DESCRIPTION:
{job_description}

RESUME:
{resume_text}

Return JSON with this exact structure:
{{
  "summary": "Updated professional summary (2-3 sentences, include JD keywords)",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "bullets": ["bullet1", "bullet2", ...]
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Enhanced description with JD keywords"
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "institution": "School Name",
      "year": "Year"
    }}
  ],
  "added_skills": ["list of skills added from JD not in original resume"],
  "keywords_added": ["list of keywords injected"]
}}

Rules:
1. Add skills from JD that are relevant and missing from resume
2. Rewrite experience bullets to include JD keywords naturally
3. Enhance project descriptions to match JD requirements
4. Keep all original facts — only enhance language and add keywords
5. Summary must reflect the target role"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    import json
    raw = message.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
