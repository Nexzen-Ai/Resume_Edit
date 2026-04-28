import hashlib
import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from database import supabase
from config import settings


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
    result = supabase.table("users").insert({
        "email": email,
        "password_hash": hashed,
        "full_name": full_name,
    }).execute()

    user = result.data[0]
    token = create_access_token({"sub": user["id"], "email": email})
    return {
        "access_token": token,
        "user_id": user["id"],
        "email": email,
        "full_name": full_name,
    }


def login_user(email: str, password: str) -> dict:
    result = supabase.table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise ValueError("Invalid credentials")

    user = result.data[0]
    if not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid credentials")

    token = create_access_token({"sub": user["id"], "email": email})
    return {
        "access_token": token,
        "user_id": user["id"],
        "email": email,
        "full_name": user["full_name"],
    }


def get_current_user(token: str) -> dict:
    payload = decode_token(token)
    if not payload:
        raise ValueError("Invalid token")

    result = supabase.table("users").select("id, email, full_name").eq("id", payload["sub"]).execute()
    if not result.data:
        raise ValueError("User not found")

    return result.data[0]
