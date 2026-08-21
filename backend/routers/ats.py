from fastapi import APIRouter, Depends, HTTPException
from models.schemas import ATSSimulateRequest, ATSSimulateResponse
from routers.auth import current_user
from services.ats_service import simulate_ats_parse
from database import supabase

router = APIRouter(prefix="/ats", tags=["ats"])


@router.post("/simulate", response_model=ATSSimulateResponse)
def simulate_ats(req: ATSSimulateRequest, user: dict = Depends(current_user)):
    user_id = user["id"]
    
    res = supabase.table("resumes").select("resume_text").eq("id", req.resume_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    resume_text = res.data[0]["resume_text"]
    
    try:
        report = simulate_ats_parse(resume_text, req.job_description)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS simulation failed: {str(e)}")
