import json
import litellm
from config import settings
from database import supabase

FACT_EXTRACTION_PROMPT = """You are an Atomic Fact Extraction Engine. Parse the input resume text and extract structured atomic facts.
Rules:
- DO NOT invent, summarize, or extrapolate facts. Extract ONLY what is explicitly stated in the resume.
- Categorize skills, tools, technologies, metrics, project scopes, and roles.

Return JSON format:
{
  "skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "metrics": ["metric1", "metric2"],
  "projects": [{"name": "project name", "scope": "scope text"}],
  "roles": [{"title": "title", "company": "company", "skills_used": ["skill1"]}]
}"""

GAP_ANALYSIS_PROMPT = """You are an Enterprise Competency Matcher.
Compare the Candidate's Fact-Graph JSON with the Target Job Description.

Identify skills, technologies, frameworks, and domain competencies required by the JD that are MISSING or UNDERREPRESENTED in the Candidate's Fact-Graph.

Rules:
- DO NOT hallucinate experience.
- Output up to 5 clear missing competencies for diagnostic testing.

Return JSON format:
{
  "missing_competencies": [
    {
      "skill": "Docker & Containerization",
      "jd_importance": "High",
      "reason": "JD demands Docker container orchestration, but candidate Fact-Graph shows no container experience."
    }
  ]
}"""


def extract_and_analyze_fact_graph(user_id: str, resume_id: str, resume_text: str, job_description: str) -> dict:
    # 1. Fact Extraction Call
    extract_response = litellm.completion(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        messages=[
            {"role": "system", "content": FACT_EXTRACTION_PROMPT},
            {"role": "user", "content": f"Resume Text:\n{resume_text[:4000]}"}
        ],
        temperature=0.1,
        response_format={"type": "json_object"}
    )
    
    raw_facts = extract_response.choices[0].message.content
    try:
        atomic_facts = json.loads(raw_facts)
    except Exception:
        atomic_facts = {"skills": [], "tools": [], "metrics": [], "projects": [], "roles": []}

    # 2. Persist in database
    try:
        supabase.table("fact_graphs").insert({
            "user_id": user_id,
            "resume_id": resume_id,
            "atomic_facts": atomic_facts
        }).execute()
    except Exception as e:
        print(f"[FactGraph] DB insert warning: {e}")

    # 3. Gap Analysis Call
    gap_response = litellm.completion(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        messages=[
            {"role": "system", "content": GAP_ANALYSIS_PROMPT},
            {"role": "user", "content": f"Fact Graph JSON:\n{json.dumps(atomic_facts)}\n\nTarget Job Description:\n{job_description[:4000]}"}
        ],
        temperature=0.2,
        response_format={"type": "json_object"}
    )
    
    raw_gaps = gap_response.choices[0].message.content
    try:
        gap_data = json.loads(raw_gaps)
        missing_competencies = gap_data.get("missing_competencies", [])
    except Exception:
        missing_competencies = []

    return {
        "resume_id": resume_id,
        "atomic_facts": atomic_facts,
        "missing_competencies": missing_competencies
    }
