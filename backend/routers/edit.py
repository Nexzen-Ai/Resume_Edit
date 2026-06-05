import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from fastapi.responses import Response
from models.schemas import (
    EditRequest, EditResponse, JobStatus,
    ExtractKeywordsRequest, ExtractKeywordsResponse,
)
from routers.auth import current_user
from services.llm_service import analyze_and_edit_resume, extract_jd_from_images
from services.resume_builder import apply_edits_to_docx
from ratelimit import limiter
from database import supabase
from config import settings

router = APIRouter(prefix="/edit", tags=["edit"])
logger = logging.getLogger(__name__)

_NO_SECTION_MSG = (
    "Could not locate Summary/Skills/Experience sections in this resume's format. "
    "Ensure standard section headings (e.g. 'PROFESSIONAL SUMMARY', 'TECHNICAL SKILLS', "
    "'PROFESSIONAL EXPERIENCE') and try again."
)


def _fail_job(job_id: str, message: str) -> None:
    try:
        supabase.table("edit_jobs").update({"status": "failed", "error": message}).eq("id", job_id).execute()
    except Exception:
        logger.exception("Could not mark job %s as failed", job_id)


def _process_edit(job_id: str, user_id: str, storage_path: str, resume_text: str,
                  job_description: str, priority_keywords: list = None) -> None:
    """Background worker: download → AI → apply edits → upload. Updates job status."""
    try:
        original_bytes = supabase.storage.from_("resumes").download(storage_path)
    except Exception:
        logger.exception("Failed to download original resume %s", storage_path)
        _fail_job(job_id, "Could not fetch your original resume. Please try again.")
        return

    try:
        edits = analyze_and_edit_resume(resume_text, job_description, priority_keywords)
    except ValueError as e:
        # Intentional, user-facing message (e.g. AI timeout).
        _fail_job(job_id, str(e))
        return
    except Exception:
        logger.exception("AI analysis failed for job %s", job_id)
        _fail_job(job_id, "AI processing failed. Please try again in a moment.")
        return

    try:
        docx_bytes, report = apply_edits_to_docx(original_bytes, edits)
    except Exception:
        logger.exception("DOCX edit failed for job %s", job_id)
        _fail_job(job_id, "Failed to apply edits to your resume.")
        return

    if not report["any_applied"]:
        # Heuristics matched nothing — output would be identical to input.
        _fail_job(job_id, _NO_SECTION_MSG)
        return

    edited_path = f"{user_id}/edited/{job_id}.docx"
    try:
        supabase.storage.from_("edited-resumes").upload(edited_path, docx_bytes)
        supabase.table("edit_jobs").update({
            "status": "done",
            "storage_path": edited_path,
            "added_skills": edits.get("added_skills", []),
            "keywords_added": edits.get("keywords_added", []),
        }).eq("id", job_id).execute()
    except Exception:
        logger.exception("Failed to store result for job %s", job_id)
        _fail_job(job_id, "Could not save your tailored resume. Please try again.")


@router.post("/", response_model=EditResponse)
def start_edit(body: EditRequest, background_tasks: BackgroundTasks, user: dict = Depends(current_user)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    # Count only non-failed jobs so a failed attempt doesn't burn the daily quota.
    count_result = supabase.table("edit_jobs") \
        .select("id", count="exact") \
        .eq("user_id", user["id"]) \
        .neq("status", "failed") \
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

    # Create the job up front, then process in the background so the request
    # returns immediately instead of blocking on the (slow) LLM call.
    job_id = str(uuid.uuid4())
    supabase.table("edit_jobs").insert({
        "id": job_id,
        "user_id": user["id"],
        "resume_id": body.resume_id,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    background_tasks.add_task(
        _process_edit, job_id, user["id"], resume["storage_path"],
        resume["resume_text"], body.job_description, body.priority_keywords,
    )

    return EditResponse(job_id=job_id, status="queued")


@router.post("/extract-keywords", response_model=ExtractKeywordsResponse)
@limiter.limit("10/minute")
def extract_keywords(request: Request, body: ExtractKeywordsRequest, user: dict = Depends(current_user)):
    """Read 1-5 JD screenshots with a vision model; return JD text + ranked keywords."""
    try:
        result = extract_jd_from_images(body.images)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception:
        logger.exception("Vision extraction failed for user %s", user["id"])
        raise HTTPException(status_code=502, detail="Could not read the screenshots. Try clearer images.")
    return ExtractKeywordsResponse(jd_text=result["jd_text"], keywords=result["keywords"])


@router.get("/{job_id}/status", response_model=JobStatus)
def get_job_status(job_id: str, user: dict = Depends(current_user)):
    result = supabase.table("edit_jobs") \
        .select("status, error") \
        .eq("id", job_id) \
        .eq("user_id", user["id"]) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = result.data[0]
    return JobStatus(job_id=job_id, status=job["status"], error=job.get("error"))


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
        .eq("status", "done") \
        .order("created_at", desc=True) \
        .execute()
    return result.data
