from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if len(v) > 128:
            raise ValueError("Password too long (max 128 characters).")
        return v

    @field_validator("full_name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name is required.")
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str


class ResumeUploadResponse(BaseModel):
    resume_id: str
    filename: str
    uploaded_at: str


class ResumeInfo(BaseModel):
    resume_id: str
    filename: str
    uploaded_at: str


class EditRequest(BaseModel):
    resume_id: str
    job_description: str

    @field_validator("job_description")
    @classmethod
    def jd_max_length(cls, v: str) -> str:
        if len(v) > 3000:
            raise ValueError("Job description must be 3000 characters or less.")
        return v


class EditResponse(BaseModel):
    job_id: str
    status: str


class JobStatus(BaseModel):
    job_id: str
    status: str
    download_url: Optional[str] = None
    error: Optional[str] = None
