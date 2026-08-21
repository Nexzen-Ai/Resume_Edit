import json
import uuid
import litellm
from config import settings
from database import supabase
from services.verification_service import create_verification_badge

DIAGNOSTIC_QUIZ_PROMPT = """You are a Technical Assessment Architect and Diagnostic Exam Engine.
Generate a 5-question targeted diagnostic exam testing candidate competency on the following missing skills/gaps.

Rules:
- Generate exactly 5 questions: 3 Multiple Choice Questions (MCQ) and 2 Short Scenario / Code Analysis Questions (with 4 choice options each).
- Each question must have 4 clear options (index 0, 1, 2, 3).
- State the correct option index (0-3) and a detailed explanation of why it is correct.
- Ensure questions measure real-world practical competency, not simple memorization.

Return JSON format:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Clear technical question...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Detailed explanation of correct answer..."
    }
  ]
}"""


def generate_diagnostic_test(user_id: str, resume_id: str, job_description: str, missing_competencies: list) -> dict:
    prompt_context = f"Target Job Description:\n{job_description[:3000]}\n\nMissing Competencies / Skills to Test:\n{json.dumps(missing_competencies)}"
    
    response = litellm.completion(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        messages=[
            {"role": "system", "content": DIAGNOSTIC_QUIZ_PROMPT},
            {"role": "user", "content": prompt_context}
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

    assessment_id = str(uuid.uuid4())
    
    try:
        supabase.table("assessments").insert({
            "id": assessment_id,
            "user_id": user_id,
            "resume_id": resume_id,
            "target_jd": job_description[:3000],
            "missing_competencies": missing_competencies,
            "questions": questions
        }).execute()
    except Exception as e:
        print(f"[Assessment] DB Insert error: {e}")

    # Strip correct_option_index & explanation for frontend test view
    client_questions = []
    for q in questions:
        client_questions.append({
            "id": q.get("id"),
            "type": q.get("type", "mcq"),
            "question": q.get("question"),
            "options": q.get("options", []),
            "explanation": None
        })

    return {
        "assessment_id": assessment_id,
        "target_jd_snippet": job_description[:200],
        "missing_competencies": missing_competencies,
        "questions": client_questions,
        "created_at": ""
    }


def grade_diagnostic_test(user_id: str, assessment_id: str, user_answers: list) -> dict:
    assessment_res = supabase.table("assessments").select("*").eq("id", assessment_id).execute()
    if not assessment_res.data:
        raise ValueError("Assessment not found")
        
    assessment = assessment_res.data[0]
    questions = assessment.get("questions", [])
    missing_comps = assessment.get("missing_competencies", [])
    
    # Map questions by ID
    q_map = {q["id"]: q for q in questions if "id" in q}
    answers_map = {a.question_id: a.selected_option_index for a in user_answers}
    
    correct_count = 0
    total_count = len(questions)
    breakdown = []
    
    for q in questions:
        q_id = q["id"]
        correct_idx = q.get("correct_option_index", 0)
        user_idx = answers_map.get(q_id, -1)
        is_correct = (user_idx == correct_idx)
        
        if is_correct:
            correct_count += 1
            
        breakdown.append({
            "question_id": q_id,
            "question": q.get("question", ""),
            "selected_option_index": user_idx,
            "correct_option_index": correct_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "No rationale provided.")
        })
        
    score_percent = round((correct_count / total_count * 100) if total_count > 0 else 0, 1)
    passed = (score_percent >= 80.0)
    
    submission_id = str(uuid.uuid4())
    
    # Save submission
    try:
        supabase.table("assessment_submissions").insert({
            "id": submission_id,
            "assessment_id": assessment_id,
            "user_id": user_id,
            "user_answers": [a.dict() for a in user_answers],
            "score_percent": score_percent,
            "passed": passed,
            "detailed_breakdown": breakdown
        }).execute()
    except Exception as e:
        print(f"[Assessment] Submission DB error: {e}")

    verification_token = None
    verified_bullet = None
    
    if passed:
        primary_skill = missing_comps[0]["skill"] if missing_comps else "Technical Competency"
        verification_data = create_verification_badge(
            user_id=user_id,
            submission_id=submission_id,
            skill_name=primary_skill,
            score_percent=score_percent
        )
        verification_token = verification_data["token_id"]
        verified_bullet = verification_data["verified_bullet"]

    return {
        "submission_id": submission_id,
        "assessment_id": assessment_id,
        "score_percent": score_percent,
        "passed": passed,
        "verification_token": verification_token,
        "verified_bullet": verified_bullet,
        "breakdown": breakdown
    }
