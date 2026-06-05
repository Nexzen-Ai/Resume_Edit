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
    role: str = "user"
    is_admin: bool = False


class RegisterResponse(BaseModel):
    message: str
    email: str


class ResumeUploadResponse(BaseModel):
    resume_id: str
    filename: str
    uploaded_at: str


class ResumeInfo(BaseModel):
    resume_id: str
    filename: str
    uploaded_at: str


def _check_jd_len(v: str) -> str:
    if len(v) > 6000:
        raise ValueError("Job description must be 6000 characters or less.")
    return v


class EditRequest(BaseModel):
    resume_id: str
    job_description: str
    # Block A: concrete skills the user kept from the analyze preview. If set,
    # only these are added (instead of the model re-deciding).
    selected_skills: List[str] = []
    # Block B: optional role/discipline terms the user opted in — forced into
    # the summary, skills, and experience bullets for a stronger tailor.
    priority_keywords: List[str] = []

    @field_validator("job_description")
    @classmethod
    def jd_max_length(cls, v: str) -> str:
        return _check_jd_len(v)


class AnalyzeRequest(BaseModel):
    resume_id: str
    job_description: str

    @field_validator("job_description")
    @classmethod
    def jd_max_length(cls, v: str) -> str:
        return _check_jd_len(v)


class AnalyzeResponse(BaseModel):
    # Block A: concrete skills that will be inserted into the resume (deselectable).
    will_add_skills: List[str]
    # Block B: optional role/discipline/ATS terms to opt into (min ~15).
    optional_terms: List[str]


class ExtractKeywordsRequest(BaseModel):
    # Data-URL base64 images (e.g. "data:image/png;base64,..."), 1-5 screenshots.
    images: List[str]

    @field_validator("images")
    @classmethod
    def limit_images(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("At least one screenshot is required.")
        if len(v) > 5:
            raise ValueError("Max 5 screenshots.")
        return v


class ExtractKeywordsResponse(BaseModel):
    jd_text: str
    keywords: List[str]


class EditResponse(BaseModel):
    job_id: str
    status: str


class JobStatus(BaseModel):
    job_id: str
    status: str
    download_url: Optional[str] = None
    error: Optional[str] = None


class GrantRequest(BaseModel):
    # Days of access from now. None/0 = unlimited (no expiry).
    days: Optional[int] = None


class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
    access_expires_at: Optional[str] = None
    email_verified: Optional[bool] = None
