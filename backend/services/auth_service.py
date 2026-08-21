import hashlib
import uuid
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from database import supabase
from config import settings


def is_admin(user: dict) -> bool:
    return user.get("role") == "admin" or (user.get("email", "").lower() in settings.admin_email_set)


def _enforce_access(user: dict) -> None:
    """Raise PermissionError if the account is disabled or its term expired."""
    if not user.get("is_active", True):
        raise PermissionError("Your access has been revoked. Contact the administrator.")
    expires = user.get("access_expires_at")
    if expires:
        try:
            exp_dt = datetime.fromisoformat(str(expires).replace("Z", "+00:00"))
            if exp_dt.tzinfo is None:
                exp_dt = exp_dt.replace(tzinfo=timezone.utc)
            if exp_dt < datetime.now(timezone.utc):
                raise PermissionError("Your access term has expired. Contact the administrator.")
        except ValueError:
            pass  # unparseable expiry — don't lock the user out


def _maybe_seed_admin(user: dict) -> dict:
    """Promote an account to admin if its email is in ADMIN_EMAILS, and keep
    admins unlimited: no expiry, always active."""
    if user.get("email", "").lower() not in settings.admin_email_set:
        return user
    needs_update = (
        user.get("role") != "admin"
        or user.get("access_expires_at") is not None
        or not user.get("is_active", True)
    )
    if needs_update:
        supabase.table("users").update({
            "role": "admin", "access_expires_at": None, "is_active": True,
        }).eq("id", user["id"]).execute()
        user["role"] = "admin"
        user["access_expires_at"] = None
        user["is_active"] = True
    return user


def _pre_hash(password: str) -> bytes:
    return hashlib.sha256(password.encode()).hexdigest().encode()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_pre_hash(password), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(_pre_hash(plain), hashed.encode())


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        return None


def register_user(email: str, password: str, full_name: str) -> dict:
    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise ValueError("Email already registered")

    hashed = hash_password(password)
    token = str(uuid.uuid4())
    supabase.table("users").insert({
        "email": email,
        "password_hash": hashed,
        "full_name": full_name,
        "email_verified": False,
        "verification_token": token,
    }).execute()

    # No access token yet — the user must verify their email before logging in.
    return {"email": email, "full_name": full_name, "verification_token": token}


def resend_verification_user(email: str) -> dict:
    """Find account by email and generate/return a verification token if unverified."""
    result = supabase.table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise ValueError("No account registered with this email.")

    user = result.data[0]
    if user.get("email_verified", False):
        raise ValueError("Your email is already verified. You can sign in now.")

    token = user.get("verification_token")
    if not token:
        token = str(uuid.uuid4())
        supabase.table("users").update({"verification_token": token}).eq("id", user["id"]).execute()

    return {
        "email": user["email"],
        "full_name": user.get("full_name", "User"),
        "verification_token": token,
    }


def update_profile(user_id: str, full_name: str = None,
                   current_password: str = None, new_password: str = None) -> str:
    """Update name and/or password. Email is never changeable. Returns the name."""
    res = supabase.table("users").select("password_hash, full_name").eq("id", user_id).execute()
    if not res.data:
        raise ValueError("User not found")
    current = res.data[0]

    patch = {}
    if full_name is not None:
        name = full_name.strip()
        if not name:
            raise ValueError("Name cannot be empty.")
        patch["full_name"] = name
    if new_password:
        if not current_password or not verify_password(current_password, current["password_hash"]):
            raise ValueError("Current password is incorrect.")
        if len(new_password) < 8:
            raise ValueError("New password must be at least 8 characters.")
        patch["password_hash"] = hash_password(new_password)

    if patch:
        supabase.table("users").update(patch).eq("id", user_id).execute()
    return patch.get("full_name", current["full_name"])


def verify_email_token(token: str) -> bool:
    """Mark the matching account verified. Returns True if a token matched."""
    if not token:
        return False
    result = supabase.table("users").select("id").eq("verification_token", token).execute()
    if not result.data:
        return False
    supabase.table("users").update({
        "email_verified": True,
        "verification_token": None,
    }).eq("id", result.data[0]["id"]).execute()
    return True


def login_user(email: str, password: str) -> dict:
    result = supabase.table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise ValueError("Invalid credentials")

    user = result.data[0]
    if not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid credentials")

    if not user.get("email_verified", False):
        raise PermissionError("Please verify your email before logging in. Check your inbox.")

    _maybe_seed_admin(user)
    if not is_admin(user):
        _enforce_access(user)  # admins are never expired/revoked

    token = create_access_token({"sub": user["id"], "email": email})
    return {
        "access_token": token,
        "user_id": user["id"],
        "email": email,
        "full_name": user["full_name"],
        "role": user.get("role", "user"),
        "is_admin": is_admin(user),
    }


def get_current_user(token: str) -> dict:
    payload = decode_token(token)
    if not payload:
        raise ValueError("Invalid token")

    result = supabase.table("users") \
        .select("id, email, full_name, role, is_active, access_expires_at, resume_limit") \
        .eq("id", payload["sub"]).execute()
    if not result.data:
        raise ValueError("User not found")

    user = _maybe_seed_admin(result.data[0])
    user["is_admin"] = is_admin(user)
    # Revoking access or expiry kills live sessions — but admins are exempt.
    if not user["is_admin"]:
        _enforce_access(user)
    return user
