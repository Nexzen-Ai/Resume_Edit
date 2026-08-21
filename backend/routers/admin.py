import logging
from collections import Counter
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from routers.auth import current_user
from services.auth_service import is_admin
from models.schemas import GrantRequest, UserUpdate, SetResumeLimit
from database import supabase

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)

_USER_FIELDS = "id, email, full_name, role, is_active, email_verified, verification_token, access_expires_at, resume_limit, created_at"


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


@router.get("/usage")
def usage_range(admin: dict = Depends(admin_required), start: str = "", end: str = ""):
    """Per-user edits (credits used) over a date range [start, end] (YYYY-MM-DD).
    Defaults to the last 30 days. Single day = start == end."""
    today = datetime.utcnow().date()
    end = end.strip() or today.isoformat()
    start = start.strip() or (today - timedelta(days=29)).isoformat()
    s, e = f"{start}T00:00:00", f"{end}T23:59:59.999999"
    rows = supabase.table("edit_jobs").select("user_id, status, created_at") \
        .gte("created_at", s).lte("created_at", e).execute().data

    total = Counter(r["user_id"] for r in rows)
    done = Counter(r["user_id"] for r in rows if r.get("status") == "done")
    users = supabase.table("users").select("id, email, full_name").execute().data
    umap = {u["id"]: u for u in users}
    per_user = [
        {
            "user_id": uid,
            "email": umap.get(uid, {}).get("email", "?"),
            "full_name": umap.get(uid, {}).get("full_name", "?"),
            "edits": cnt,
            "edits_done": done.get(uid, 0),
        }
        for uid, cnt in total.items()
    ]
    per_user.sort(key=lambda x: -x["edits"])
    return {"start": start, "end": end, "total_edits": len(rows), "users": per_user}


@router.get("/usage/daily")
def usage_daily(admin: dict = Depends(admin_required), days: int = 14):
    """Total edits per day for the last N days (most recent first)."""
    days = max(1, min(days, 90))
    since = (datetime.utcnow().date() - timedelta(days=days - 1)).isoformat()
    rows = supabase.table("edit_jobs").select("created_at") \
        .gte("created_at", f"{since}T00:00:00").execute().data
    by_day = Counter((r["created_at"] or "")[:10] for r in rows if r.get("created_at"))
    return [{"date": d, "edits": by_day.get(d, 0)}
            for d in sorted(by_day) ][::-1] or [{"date": since, "edits": 0}]


@router.get("/users")
def list_users(admin: dict = Depends(admin_required), search: str = ""):
    q = supabase.table("users").select(_USER_FIELDS).order("created_at", desc=True)
    if search.strip():
        q = q.ilike("email", f"%{search.strip()}%")
    users = q.limit(500).execute().data

    # Per-user activity counts (resumes uploaded, edits done/total).
    resumes = supabase.table("resumes").select("user_id").execute().data
    edits = supabase.table("edit_jobs").select("user_id, status").execute().data
    rc = Counter(r["user_id"] for r in resumes)
    et = Counter(e["user_id"] for e in edits)
    ed = Counter(e["user_id"] for e in edits if e.get("status") == "done")
    for u in users:
        u["resume_count"] = rc.get(u["id"], 0)
        u["edits_total"] = et.get(u["id"], 0)
        u["edits_done"] = ed.get(u["id"], 0)
    return users


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


@router.post("/users/{user_id}/verify-email")
def admin_verify_email(user_id: str, admin: dict = Depends(admin_required)):
    """Manually mark a user's email as verified (bypassing SMTP email requirement)."""
    supabase.table("users").update({"email_verified": True, "verification_token": None}).eq("id", user_id).execute()
    return {"message": "User email verified by admin"}


@router.patch("/users/{user_id}")
def update_user(user_id: str, body: UserUpdate, admin: dict = Depends(admin_required)):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if user_id == admin["id"] and patch.get("is_active") is False:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")
    if patch:
        supabase.table("users").update(patch).eq("id", user_id).execute()
    return {"message": "Updated"}


@router.post("/users/{user_id}/resume-limit")
def set_resume_limit(user_id: str, body: SetResumeLimit, admin: dict = Depends(admin_required)):
    limit = max(0, body.limit)
    supabase.table("users").update({"resume_limit": limit}).eq("id", user_id).execute()
    return {"message": f"Resume limit set to {limit}"}


@router.get("/upgrade-requests")
def upgrade_requests(admin: dict = Depends(admin_required), status: str = "pending"):
    q = supabase.table("upgrade_requests").select("*").order("created_at", desc=True)
    if status:
        q = q.eq("status", status)
    return q.limit(200).execute().data


@router.post("/upgrade-requests/{req_id}/handle")
def handle_request(req_id: str, admin: dict = Depends(admin_required)):
    supabase.table("upgrade_requests").update({"status": "handled"}).eq("id", req_id).execute()
    return {"message": "Marked handled"}


@router.post("/upgrade-requests/{req_id}/approve-limit")
def approve_request_limit(req_id: str, admin: dict = Depends(admin_required)):
    """Approve request: Increase user's resume limit by +1."""
    req = supabase.table("upgrade_requests").select("*").eq("id", req_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Request not found")
    user_id = req.data[0]["user_id"]
    u = supabase.table("users").select("resume_limit").eq("id", user_id).execute()
    curr = u.data[0].get("resume_limit", 1) if u.data else 1
    new_limit = curr + 1
    supabase.table("users").update({"resume_limit": new_limit}).eq("id", user_id).execute()
    supabase.table("upgrade_requests").update({"status": "handled"}).eq("id", req_id).execute()
    return {"message": f"Approved! Resume limit increased to {new_limit}"}


@router.post("/upgrade-requests/{req_id}/approve-clear-resume")
def approve_request_clear_resume(req_id: str, admin: dict = Depends(admin_required)):
    """Approve request: Clear user's uploaded resume so they can upload a new one."""
    req = supabase.table("upgrade_requests").select("*").eq("id", req_id).execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Request not found")
    user_id = req.data[0]["user_id"]
    resumes = supabase.table("resumes").select("id, storage_path").eq("user_id", user_id).execute()
    for r in resumes.data:
        try:
            supabase.storage.from_("resumes").remove([r["storage_path"]])
        except Exception:
            pass
        supabase.table("resumes").delete().eq("id", r["id"]).execute()
    supabase.table("upgrade_requests").update({"status": "handled"}).eq("id", req_id).execute()
    return {"message": "Approved! User resume cleared. User can now upload a new resume."}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, admin: dict = Depends(admin_required)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    # resumes/edit_jobs cascade via FK ON DELETE CASCADE.
    supabase.table("users").delete().eq("id", user_id).execute()
    return {"message": "User deleted"}
