import json
import uuid
import litellm
from config import settings
from database import supabase

STAR_INTERVIEW_PROMPT = """You are an Executive Technical Recruiter and Career Readiness Coach.
Generate 3-5 high-stakes technical & behavioral interview questions targeting experience gaps and low YOE (Years of Experience) for the candidate.

For each question, provide an Ideal Response Framework using the STAR method (Situation, Task, Action, Result) tailored to the candidate's actual resume experience.

Rules:
- Questions must probe how candidate handles complex scenarios without years of experience.
- STAR framework must be structured with explicit situation, task, action, and result keys.

Return JSON format:
{
  "questions": [
    {
      "probe_area": "Limited Production Docker Experience",
      "question": "How would you approach containerizing a multi-tier microservice architecture despite limited production YOE?",
      "star_framework": {
        "situation": "In my recent backend project, we deployed services manually which caused environment drift...",
        "task": "My goal was to standardize build artifacts into reproducible container images...",
        "action": "I authored multi-stage Dockerfiles, decoupled environment configs, and implemented healthcheck probes...",
        "result": "Streamlined setup time from 3 hours to under 2 minutes with zero container runtime errors."
      }
    }
  ]
}"""


def generate_interview_prep(user_id: str, resume_id: str, resume_text: str, job_description: str) -> dict:
    prompt_user = f"Candidate Resume:\n{resume_text[:3000]}\n\nTarget Job Description:\n{job_description[:3000]}"
    
    response = litellm.completion(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        messages=[
            {"role": "system", "content": STAR_INTERVIEW_PROMPT},
            {"role": "user", "content": prompt_user}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    raw_content = response.choices[0].message.content
    try:
        data = json.loads(raw_content)
        questions = data.get("questions", [])
    except Exception:
        questions = []

    prep_id = str(uuid.uuid4())
    gap_topics = [q.get("probe_area", "Experience Gap") for q in questions]

    try:
        supabase.table("interview_prep").insert({
            "id": prep_id,
            "user_id": user_id,
            "resume_id": resume_id,
            "gap_topics": gap_topics,
            "star_questions": questions
        }).execute()
    except Exception as e:
        print(f"[InterviewPrep] DB insert error: {e}")

    return {
        "interview_prep_id": prep_id,
        "gap_topics": gap_topics,
        "questions": questions
    }
