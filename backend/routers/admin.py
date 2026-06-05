import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from routers.auth import current_user
from services.auth_service import is_admin
from models.schemas import GrantRequest, UserUpdate
from database import supabase

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)

_USER_FIELDS = "id, email, full_name, role, is_active, email_verified, access_expires_at, created_at"


def admin_required(user: dict = Depends(current_user)) -> dict:
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/stats")
def stats(admin: dict = Depends(admin_required)):
    users = supabase.table("users").select("id, is_active").execute()
    total = len(users.data)
    active = sum(1 for u in users.data if u.get("is_active"))
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    edits = supabase.table("edit_jobs").select("id", count="exact").gte("created_at", today).execute()
    return {"total_users": total, "active_users": active, "edits_today": edits.count or 0}


@router.get("/users")
def list_users(admin: dict = Depends(admin_required), search: str = ""):
    q = supabase.table("users").select(_USER_FIELDS).order("created_at", desc=True)
    if search.strip():
        q = q.ilike("email", f"%{search.strip()}%")
    return q.limit(500).execute().data


@router.post("/users/{user_id}/grant")
def grant_access(user_id: str, body: GrantRequest, admin: dict = Depends(admin_required)):
    """Activate the account and (optionally) set an expiry N days out. days=None → unlimited."""
    expires = None
    if body.days and body.days > 0:
        expires = (datetime.now(timezone.utc) + timedelta(days=body.days)).isoformat()
    supabase.table("users").update({"is_active": True, "access_expires_at": expires}).eq("id", user_id).execute()
    return {"message": "Access granted", "access_expires_at": expires}


@router.post("/users/{user_id}/revoke")
def revoke_access(user_id: str, admin: dict = Depends(admin_required)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You cannot revoke your own access.")
    supabase.table("users").update({"is_active": False}).eq("id", user_id).execute()
    return {"message": "Access revoked"}


@router.patch("/users/{user_id}")
def update_user(user_id: str, body: UserUpdate, admin: dict = Depends(admin_required)):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if user_id == admin["id"] and patch.get("is_active") is False:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")
    if patch:
        supabase.table("users").update(patch).eq("id", user_id).execute()
    return {"message": "Updated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, admin: dict = Depends(admin_required)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    # resumes/edit_jobs cascade via FK ON DELETE CASCADE.
    supabase.table("users").delete().eq("id", user_id).execute()
    return {"message": "User deleted"}
