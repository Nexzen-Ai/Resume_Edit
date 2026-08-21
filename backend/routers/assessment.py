from fastapi import APIRouter, Depends, HTTPException, status
from models.schemas import (
    AssessmentGenerateRequest,
    AssessmentGenerateResponse,
    AssessmentSubmitRequest,
    AssessmentSubmitResponse
)
from services.auth_service import register_user
from routers.auth import current_user
from services.credit_service import check_and_deduct_credits
from services.fact_graph_service import extract_and_analyze_fact_graph
from services.assessment_service import generate_diagnostic_test, grade_diagnostic_test
from database import supabase

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.post("/generate", response_model=AssessmentGenerateResponse)
def generate_assessment(req: AssessmentGenerateRequest, user: dict = Depends(current_user)):
    user_id = user["id"]
    
    # 1. Fetch resume text
    res = supabase.table("resumes").select("resume_text").eq("id", req.resume_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    resume_text = res.data[0]["resume_text"]

    # 2. Credit check (costs 2 credits)
    success = check_and_deduct_credits(
        user_id=user_id,
        cost=2,
        transaction_type="test_used",
        description="Generated Adaptive Diagnostic Skill Assessment"
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Generating an Adaptive Diagnostic Assessment costs 2 credits."
        )

    # 3. Extract Fact-Graph & Missing Competencies
    try:
        fact_data = extract_and_analyze_fact_graph(
            user_id=user_id,
            resume_id=req.resume_id,
            resume_text=resume_text,
            job_description=req.job_description
        )
        missing_comps = fact_data.get("missing_competencies", [])

        # 4. Generate Diagnostic Test
        assessment = generate_diagnostic_test(
            user_id=user_id,
            resume_id=req.resume_id,
            job_description=req.job_description,
            missing_competencies=missing_comps
        )
        return assessment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment generation failed: {str(e)}")


@router.post("/submit", response_model=AssessmentSubmitResponse)
def submit_assessment(req: AssessmentSubmitRequest, user: dict = Depends(current_user)):
    user_id = user["id"]
    try:
        result = grade_diagnostic_test(
            user_id=user_id,
            assessment_id=req.assessment_id,
            user_answers=req.answers
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Grading failed: {str(e)}")
