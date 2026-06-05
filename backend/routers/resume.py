import os
import re
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from models.schemas import ResumeUploadResponse, ResumeInfo
from routers.auth import current_user
from services.resume_parser import extract_resume_text, strip_resume
from database import supabase

router = APIRouter(prefix="/resume", tags=["resume"])

ALLOWED_TYPES = {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


def _safe_filename(filename: str) -> str:
    """Strip any path components and unsafe chars to prevent path traversal in storage keys."""
    base = os.path.basename(filename or "").replace("\\", "/").split("/")[-1]
    base = re.sub(r"[^A-Za-z0-9._-]", "_", base).strip("._") or "resume"
    return base[:120]


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    user: dict = Depends(current_user),
):
    existing = supabase.table("resumes").select("id").eq("user_id", user["id"]).execute()
    if existing.data:
        raise HTTPException(
            status_code=400,
            detail="You already have a resume uploaded. Delete it first before uploading a new one.",
        )

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only DOCX (.docx) files are supported")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    try:
        resume_text = strip_resume(extract_resume_text(content, file.filename))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    resume_id = str(uuid.uuid4())
    safe_name = _safe_filename(file.filename)
    storage_path = f"{user['id']}/{resume_id}/{safe_name}"

    # Upload file to Supabase storage
    supabase.storage.from_("resumes").upload(storage_path, content)

    # Store metadata + extracted text in DB
    supabase.table("resumes").insert({
        "id": resume_id,
        "user_id": user["id"],
        "filename": file.filename,
        "storage_path": storage_path,
        "resume_text": resume_text,
        "uploaded_at": datetime.utcnow().isoformat(),
    }).execute()

    return ResumeUploadResponse(
        resume_id=resume_id,
        filename=file.filename,
        uploaded_at=datetime.utcnow().isoformat(),
    )


@router.get("/", response_model=list[ResumeInfo])
def list_resumes(user: dict = Depends(current_user)):
    result = supabase.table("resumes") \
        .select("id, filename, uploaded_at") \
        .eq("user_id", user["id"]) \
        .order("uploaded_at", desc=True) \
        .execute()
    return [ResumeInfo(resume_id=r["id"], filename=r["filename"], uploaded_at=r["uploaded_at"]) for r in result.data]


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, user: dict = Depends(current_user)):
    result = supabase.table("resumes").select("*").eq("id", resume_id).eq("user_id", user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume = result.data[0]
    supabase.storage.from_("resumes").remove([resume["storage_path"]])
    supabase.table("resumes").delete().eq("id", resume_id).execute()
    return {"message": "Deleted"}
