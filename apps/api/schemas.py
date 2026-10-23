"""
REET Pydantic v2 Schemas
Strict boundary validation for all API inputs and outputs.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# User Schemas
class UserBase(BaseModel):
    username: str
    full_name: str
    college: str
    state: str
    preferred_language: str = "en"
    avatar: str = "👨‍💻"

class UserOut(UserBase):
    id: str
    trust_quotient: int
    safety_skill_earned: bool
    safety_badge_hash: Optional[str] = None
    created_at: datetime
    skills: Optional[Dict[str, int]] = {}

    class Config:
        from_attributes = True

# Project Schemas
class ProjectImportRequest(BaseModel):
    github_url: str = Field(..., description="Public GitHub repository URL")
    user_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    user_consent_agreed: bool = Field(True, description="Explicit student consent to scan public code")

class ProjectVersionOut(BaseModel):
    id: str
    commit_hash: str
    commit_message: Optional[str] = None
    commit_history_spread_days: float
    created_at: datetime

    class Config:
        from_attributes = True

class ScoreBreakdownOut(BaseModel):
    works_score: float
    works_reason: str
    code_quality_score: float
    code_quality_reason: str
    originality_score: float
    originality_reason: str
    presentation_score: float
    presentation_reason: str
    understanding_score: float
    understanding_reason: str
    security_findings: List[str] = []
    evidence_snippets: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class ScoreRunOut(BaseModel):
    id: str
    version_id: str
    status: str
    overall_score: Optional[float] = None
    confidence: str = "HIGH"
    sandbox_executed: bool = True
    sandbox_fallback_reason: Optional[str] = None
    prompt_injection_flagged: bool = False
    prompt_injection_penalty: float = 0.0
    started_at: datetime
    completed_at: Optional[datetime] = None
    breakdown: Optional[ScoreBreakdownOut] = None

    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    github_repo_url: str
    primary_language: str
    primary_domain: str
    is_duplicate: bool = False
    original_project_id: Optional[str] = None
    is_private: bool = False
    created_at: datetime
    latest_score: Optional[float] = None
    latest_score_run: Optional[ScoreRunOut] = None

    class Config:
        from_attributes = True

# Social Feed Schemas
class PostCreate(BaseModel):
    user_id: str
    post_type: str = Field(..., description="SHOWCASE, UPCOMING, TEAM_CALL")
    title: str
    body: str
    project_id: Optional[str] = None
    skills_required: List[str] = []
    roles_needed: List[str] = []
    video_url: Optional[str] = None

class PostOut(BaseModel):
    id: str
    user_id: str
    post_type: str
    title: str
    body: str
    skills_required: List[str] = []
    roles_needed: List[str] = []
    video_url: Optional[str] = None
    subtitles_vtt: Optional[str] = None
    likes_count: int = 0
    created_at: datetime
    author: Optional[UserOut] = None
    project: Optional[ProjectOut] = None
    risk_score: Optional[float] = 0.0
    risk_band: Optional[str] = "GREEN"
    is_blocked: bool = False

    class Config:
        from_attributes = True

# Code Defense Schemas
class DefenseQuestion(BaseModel):
    question_id: str
    file_path: str
    question_text: str
    options: Optional[List[str]] = None
    category: str

class DefenseStartResponse(BaseModel):
    session_id: str
    score_run_id: str
    time_limit_seconds: int = 180
    questions: List[DefenseQuestion]

class DefenseSubmitRequest(BaseModel):
    session_id: str
    answers: List[Dict[str, Any]]

class DefenseResultOut(BaseModel):
    session_id: str
    score: float
    understanding_points: float
    feedback_tone: str
    summary: str

# Team Up Schemas
class CandidateMatchOut(BaseModel):
    user: UserOut
    match_score: float
    one_line_reason: str
    relevant_skills: Dict[str, int]
    top_project_title: Optional[str] = None

class TeamUpResponse(BaseModel):
    post_id: str
    required_skills: List[str]
    candidates: List[CandidateMatchOut]

# Trust Shield Schemas
class TrustScanRequest(BaseModel):
    text: str
    language_code: Optional[str] = "en"
    domain: Optional[str] = None

class TrustScanOut(BaseModel):
    risk_score: float
    risk_band: str # GREEN, AMBER, RED
    decision: str # ALLOW, FLAG_WARNING, BLOCK
    is_blocked: bool
    triggered_rules: List[Dict[str, Any]]
    explanation: Dict[str, Any]
    multilingual_explanation: Dict[str, Any]

class PaymentInspectRequest(BaseModel):
    message: str

class PaymentInspectOut(BaseModel):
    is_payment_moment: bool
    detected_upis: List[str]
    detected_uris: List[str]
    amount: Optional[int] = None
    coercion_signals: List[Dict[str, Any]]
    payment_risk_score: float
    warning_modal_data: Optional[Dict[str, Any]] = None

class ScamReportCreate(BaseModel):
    reporter_id: str
    suspect_handle: str
    suspect_upi: str
    solicited_amount: Optional[float] = None
    evidence_text: str

class ScamReportOut(BaseModel):
    id: str
    reporter_id: str
    suspect_handle: str
    suspect_upi: str
    solicited_amount: Optional[float] = None
    cybercrime_dossier: str
    helpline: str = "1930"
    status: str
    confirmed_at: datetime
    safety_skill_awarded: bool = True
