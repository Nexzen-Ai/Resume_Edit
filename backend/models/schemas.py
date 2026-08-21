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


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UpgradeRequestBody(BaseModel):
    message: Optional[str] = None


class SetResumeLimit(BaseModel):
    limit: int


class GrantRequest(BaseModel):
    # Days of access from now. None/0 = unlimited (no expiry).
    days: Optional[int] = None


class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None
    access_expires_at: Optional[str] = None
    email_verified: Optional[bool] = None


# Fact Graph & Missing Competencies Schemas
class MissingCompetency(BaseModel):
    skill: str
    jd_importance: str
    reason: str


class FactGraphResponse(BaseModel):
    resume_id: str
    atomic_facts: dict
    missing_competencies: List[MissingCompetency]


# Diagnostic Assessment Schemas
class AssessmentQuestion(BaseModel):
    id: str
    type: str  # 'mcq' or 'scenario'
    question: str
    options: List[str]
    explanation: Optional[str] = None


class AssessmentGenerateRequest(BaseModel):
    resume_id: str
    job_description: str


class AssessmentGenerateResponse(BaseModel):
    assessment_id: str
    target_jd_snippet: str
    missing_competencies: List[MissingCompetency]
    questions: List[AssessmentQuestion]
    created_at: str


class UserAnswer(BaseModel):
    question_id: str
    selected_option_index: int


class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: List[UserAnswer]


class QuestionGradingResult(BaseModel):
    question_id: str
    question: str
    selected_option_index: int
    correct_option_index: int
    is_correct: bool
    explanation: str


class AssessmentSubmitResponse(BaseModel):
    submission_id: str
    assessment_id: str
    score_percent: float
    passed: bool
    verification_token: Optional[str] = None
    verified_bullet: Optional[str] = None
    breakdown: List[QuestionGradingResult]


# Cryptographic Verification Schemas
class VerificationPublicResponse(BaseModel):
    token_id: str
    user_name: str
    skill_name: str
    score_percent: float
    passed_at: str
    signature_hash: str
    verified_status: str = "OFFICIALLY VERIFIED BY NEXCV"


# Low-YOE Interview Prep Schemas
class StarResponseFramework(BaseModel):
    situation: str
    task: str
    action: str
    result: str


class InterviewQuestionItem(BaseModel):
    probe_area: str
    question: str
    star_framework: StarResponseFramework


class InterviewPrepGenerateRequest(BaseModel):
    resume_id: str
    job_description: str


class InterviewPrepResponse(BaseModel):
    interview_prep_id: str
    gap_topics: List[str]
    questions: List[InterviewQuestionItem]


# Credit & Referral Architecture Schemas
class CreditLedgerItem(BaseModel):
    amount: int
    transaction_type: str
    description: Optional[str] = None
    created_at: str


class CreditBalanceResponse(BaseModel):
    credits_balance: int
    is_edu_verified: bool
    referral_code: str
    history: List[CreditLedgerItem]


class EduVerificationResponse(BaseModel):
    success: bool
    message: str
    bonus_granted: int
    new_balance: int


class RedeemReferralRequest(BaseModel):
    referral_code: str


class RedeemReferralResponse(BaseModel):
    success: bool
    message: str
    credits_granted: int
    new_balance: int


# ATS Parsing Simulator Schemas
class ATSSimulateRequest(BaseModel):
    resume_id: str
    job_description: str


class ATSParseSegment(BaseModel):
    text: str
    status: str  # 'ok', 'warning', 'drop_risk'
    issue_reason: Optional[str] = None


class UnsuitableKeywordFeedback(BaseModel):
    keyword: str
    reason: str


class ATSScoreBreakdown(BaseModel):
    initial_baseline_score: int
    format_cleanup_boost: int
    suitable_skill_injection_boost: int
    exact_optimized_score: int
    exact_delta: int


class ATSSimulateResponse(BaseModel):
    overall_match_score: int
    parsed_segments: List[ATSParseSegment]
    matched_keywords: List[str]
    missing_keywords: List[str]
    suitable_injections: List[str] = []
    unsuitable_keywords_feedback: List[UnsuitableKeywordFeedback] = []
    optimized_match_score: int = 95
    optimized_segments: List[ATSParseSegment] = []
    score_breakdown: Optional[ATSScoreBreakdown] = None
    layout_score: int
    readability_feedback: List[str]

