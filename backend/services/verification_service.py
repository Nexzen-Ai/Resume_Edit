import hmac
import hashlib
import uuid
from datetime import datetime
from config import settings
from database import supabase


def generate_signature(user_id: str, skill_name: str, score_percent: float) -> str:
    secret = settings.jwt_secret.encode("utf-8")
    payload = f"{user_id}:{skill_name}:{score_percent}".encode("utf-8")
    return hmac.new(secret, payload, hashlib.sha256).hexdigest()[:32]


def create_verification_badge(user_id: str, submission_id: str, skill_name: str, score_percent: float) -> dict:
    token_id = f"v_{uuid.uuid4().hex[:12]}"
    signature_hash = generate_signature(user_id, skill_name, score_percent)
    
    try:
        supabase.table("verifications").insert({
            "token_id": token_id,
            "user_id": user_id,
            "submission_id": submission_id,
            "skill_name": skill_name,
            "score_percent": score_percent,
            "signature_hash": signature_hash
        }).execute()
    except Exception as e:
        print(f"[Verification] DB insert warning: {e}")

    verified_bullet = f"[NexCV Verified Skill: {skill_name} — {score_percent}% Diagnostic Proof | nexcv.me/verify/{token_id}]"
    
    return {
        "token_id": token_id,
        "signature_hash": signature_hash,
        "verified_bullet": verified_bullet
    }


def get_public_verification(token_id: str) -> dict:
    res = supabase.table("verifications").select("*, users(full_name)").eq("token_id", token_id).execute()
    if not res.data:
        raise ValueError("Verification token not found or invalid.")
        
    data = res.data[0]
    user_info = data.get("users", {}) or {}
    user_name = user_info.get("full_name", "Verified Candidate")
    
    return {
        "token_id": data["token_id"],
        "user_name": user_name,
        "skill_name": data["skill_name"],
        "score_percent": float(data["score_percent"]),
        "passed_at": data.get("created_at", datetime.utcnow().isoformat()),
        "signature_hash": data["signature_hash"],
        "verified_status": "OFFICIALLY VERIFIED BY NEXCV PROOF ENGINE"
    }
