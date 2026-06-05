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
    """Promote an account to admin if its email is in ADMIN_EMAILS."""
    if user.get("email", "").lower() in settings.admin_email_set and user.get("role") != "admin":
        supabase.table("users").update({"role": "admin"}).eq("id", user["id"]).execute()
        user["role"] = "admin"
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
    _enforce_access(user)

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
        .select("id, email, full_name, role, is_active, access_expires_at") \
        .eq("id", payload["sub"]).execute()
    if not result.data:
        raise ValueError("User not found")

    user = _maybe_seed_admin(result.data[0])
    # Revoking access or expiry kills live sessions, not just new logins.
    _enforce_access(user)
    user["is_admin"] = is_admin(user)
    return user
