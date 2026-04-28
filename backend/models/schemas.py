from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str


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


class EditResponse(BaseModel):
    job_id: str
    status: str


class JobStatus(BaseModel):
    job_id: str
    status: str
    download_url: Optional[str] = None
    error: Optional[str] = None
