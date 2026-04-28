from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.schemas import UserRegister, UserLogin, TokenResponse
from services.auth_service import register_user, login_user, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
bearer = HTTPBearer()


def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    try:
        return get_current_user(credentials.credentials)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/register", response_model=TokenResponse)
def register(body: UserRegister):
    try:
        result = register_user(body.email, body.password, body.full_name)
        return TokenResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin):
    try:
        result = login_user(body.email, body.password)
        return TokenResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
def me(user: dict = Depends(current_user)):
    return user
