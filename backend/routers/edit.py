import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from models.schemas import EditRequest, EditResponse, JobStatus
from routers.auth import current_user
from services.llm_service import analyze_and_edit_resume
from services.resume_builder import apply_edits_to_docx
from database import supabase
from config import settings

router = APIRouter(prefix="/edit", tags=["edit"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=EditResponse)
def start_edit(body: EditRequest, user: dict = Depends(current_user)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    count_result = supabase.table("edit_jobs") \
        .select("id", count="exact") \
        .eq("user_id", user["id"]) \
        .gte("created_at", today_start) \
        .execute()
    if (count_result.count or 0) >= settings.daily_edit_limit:
        raise HTTPException(status_code=429, detail=f"Daily limit of {settings.daily_edit_limit} edits reached. Try again tomorrow.")

    result = supabase.table("resumes") \
        .select("resume_text, filename, storage_path") \
        .eq("id", body.resume_id) \
        .eq("user_id", user["id"]) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume = result.data[0]

    if not resume["filename"].lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only DOCX resumes supported for editing. Please upload a .docx file.")

    # Download original file bytes
    try:
        original_bytes = supabase.storage.from_("resumes").download(resume["storage_path"])
    except Exception:
        logger.exception("Failed to download original resume %s", resume["storage_path"])
        raise HTTPException(status_code=502, detail="Could not fetch your original resume. Please try again.")

    # AI analysis — returns minimal edits only
    try:
        edits = analyze_and_edit_resume(resume["resume_text"], body.job_description)
    except ValueError as e:
        # Intentional, user-facing message (e.g. AI timeout).
        raise HTTPException(status_code=502, detail=str(e))
    except Exception:
        logger.exception("AI analysis failed for user %s", user["id"])
        raise HTTPException(status_code=502, detail="AI processing failed. Please try again in a moment.")

    # Apply edits to original DOCX — preserves all structure/formatting
    try:
        docx_bytes, report = apply_edits_to_docx(original_bytes, edits)
    except Exception:
        logger.exception("DOCX edit failed for user %s", user["id"])
        raise HTTPException(status_code=500, detail="Failed to apply edits to your resume.")

    # Section heuristics matched nothing — output would be identical to input.
    # Fail loudly instead of handing back an unchanged resume.
    if not report["any_applied"]:
        raise HTTPException(
            status_code=422,
            detail="Could not locate Summary/Skills/Experience sections in this resume's format. "
                   "Ensure standard section headings (e.g. 'PROFESSIONAL SUMMARY', 'TECHNICAL SKILLS', "
                   "'PROFESSIONAL EXPERIENCE') and try again.",
        )

    job_id = str(uuid.uuid4())
    storage_path = f"{user['id']}/edited/{job_id}.docx"
    supabase.storage.from_("edited-resumes").upload(storage_path, docx_bytes)

    supabase.table("edit_jobs").insert({
        "id": job_id,
        "user_id": user["id"],
        "resume_id": body.resume_id,
        "status": "done",
        "storage_path": storage_path,
        "added_skills": edits.get("added_skills", []),
        "keywords_added": edits.get("keywords_added", []),
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    return EditResponse(job_id=job_id, status="done")


@router.get("/{job_id}/status", response_model=JobStatus)
def get_job_status(job_id: str, user: dict = Depends(current_user)):
    result = supabase.table("edit_jobs") \
        .select("*") \
        .eq("id", job_id) \
        .eq("user_id", user["id"]) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = result.data[0]
    return JobStatus(job_id=job_id, status=job["status"])


@router.get("/{job_id}/download")
def download_edited_resume(job_id: str, user: dict = Depends(current_user)):
    result = supabase.table("edit_jobs") \
        .select("storage_path, status") \
        .eq("id", job_id) \
        .eq("user_id", user["id"]) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = result.data[0]
    if job["status"] != "done":
        raise HTTPException(status_code=400, detail="Resume not ready yet")

    file_bytes = supabase.storage.from_("edited-resumes").download(job["storage_path"])

    return Response(
        content=file_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=tailored_resume_{job_id}.docx"},
    )


@router.get("/history")
def edit_history(user: dict = Depends(current_user)):
    result = supabase.table("edit_jobs") \
        .select("id, resume_id, status, created_at, added_skills, keywords_added") \
        .eq("user_id", user["id"]) \
        .order("created_at", desc=True) \
        .execute()
    return result.data
