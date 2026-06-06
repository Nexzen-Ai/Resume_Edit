import logging
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.schemas import UserRegister, UserLogin, TokenResponse, RegisterResponse, ProfileUpdate
from services.auth_service import register_user, login_user, get_current_user, verify_email_token, update_profile
from services.email_service import send_verification_email
from ratelimit import limiter
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()
logger = logging.getLogger(__name__)


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        return get_current_user(credentials.credentials)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register", response_model=RegisterResponse)
@limiter.limit("5/minute")
def register(request: Request, body: UserRegister):
    try:
        result = register_user(body.email, body.password, body.full_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Never blocks on email problems — failures are logged with the link inside.
    send_verification_email(result["email"], result["full_name"], result["verification_token"])

    return RegisterResponse(
        message="Account created. Check your email and verify it before logging in.",
        email=result["email"],
    )


@router.get("/verify")
def verify(token: str):
    ok = verify_email_token(token)
    # Redirect back to the frontend login with a status flag.
    return RedirectResponse(url=f"{settings.frontend_url.rstrip('/')}/login?verified={'1' if ok else '0'}")


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, body: UserLogin):
    try:
        result = login_user(body.email, body.password)
        return TokenResponse(**result)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
def me(user: dict = Depends(current_user)):
    return user


@router.patch("/me")
def update_me(body: ProfileUpdate, user: dict = Depends(current_user)):
    try:
        name = update_profile(user["id"], body.full_name, body.current_password, body.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "Profile updated", "full_name": name, "email": user["email"]}
