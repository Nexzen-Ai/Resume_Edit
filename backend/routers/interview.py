from fastapi import APIRouter, Depends, HTTPException, status
from models.schemas import InterviewPrepGenerateRequest, InterviewPrepResponse
from routers.auth import current_user
from services.credit_service import check_and_deduct_credits
from services.interview_service import generate_interview_prep
from database import supabase

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/generate", response_model=InterviewPrepResponse)
def generate_interview(req: InterviewPrepGenerateRequest, user: dict = Depends(current_user)):
    user_id = user["id"]
    
    res = supabase.table("resumes").select("resume_text").eq("id", req.resume_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    resume_text = res.data[0]["resume_text"]

    success = check_and_deduct_credits(
        user_id=user_id,
        cost=1,
        transaction_type="interview_used",
        description="Generated Low-YOE STAR Interview Defense Preparation"
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Generating STAR Interview Defense prep costs 1 credit."
        )

    try:
        prep = generate_interview_prep(
            user_id=user_id,
            resume_id=req.resume_id,
            resume_text=resume_text,
            job_description=req.job_description
        )
        return prep
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Interview prep generation failed: {str(e)}")
