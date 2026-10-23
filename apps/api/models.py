"""
REET SQLAlchemy Data Models (17 Tables)
Implements all entities for the Proof Engine, Social Feed, Team Up, and Trust Shield.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from apps.api.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    github_id = Column(String(64), unique=True, nullable=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=True)
    college = Column(String(256), nullable=False)
    state = Column(String(64), nullable=False)
    preferred_language = Column(String(10), default="en") # 'ta', 'hi', 'te', 'ml', 'en'
    trust_quotient = Column(Integer, default=60) # 0 to 100
    safety_skill_earned = Column(Boolean, default=False)
    safety_badge_hash = Column(String(64), nullable=True)
    avatar = Column(String(16), default="👨‍💻")
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    skill_points = relationship("SkillPoint", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    github_repo_url = Column(String(512), nullable=False)
    primary_language = Column(String(64), default="Python")
    primary_domain = Column(String(64), default="Web") # Web, ML, Systems, IoT, Mobile
    is_duplicate = Column(Boolean, default=False)
    original_project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    versions = relationship("ProjectVersion", back_populates="project", cascade="all, delete-orphan")

class ProjectVersion(Base):
    __tablename__ = "project_versions"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    commit_hash = Column(String(64), nullable=False, index=True)
    commit_message = Column(String(512), nullable=True)
    commit_history_spread_days = Column(Float, default=1.0)
    archive_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="versions")
    score_runs = relationship("ScoreRun", back_populates="version", cascade="all, delete-orphan")

class ScoreRun(Base):
    __tablename__ = "score_runs"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    version_id = Column(String(36), ForeignKey("project_versions.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(32), default="QUEUED") # QUEUED, SANDBOXING, ANALYZING, SCORING, COMPLETED, FAILED
    overall_score = Column(Float, nullable=True) # 0.0 to 10.0
    confidence = Column(String(16), default="HIGH") # HIGH, MEDIUM, LOW
    sandbox_executed = Column(Boolean, default=True)
    sandbox_fallback_reason = Column(String(256), nullable=True)
    prompt_injection_flagged = Column(Boolean, default=False)
    prompt_injection_penalty = Column(Float, default=0.0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    version = relationship("ProjectVersion", back_populates="score_runs")
    breakdown = relationship("ScoreBreakdown", back_populates="score_run", uselist=False, cascade="all, delete-orphan")
    defense_sessions = relationship("DefenseSession", back_populates="score_run", cascade="all, delete-orphan")

class ScoreBreakdown(Base):
    __tablename__ = "score_breakdowns"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    score_run_id = Column(String(36), ForeignKey("score_runs.id", ondelete="CASCADE"), unique=True, nullable=False)
    works_score = Column(Float, nullable=False) # 30%
    works_reason = Column(Text, nullable=False)
    code_quality_score = Column(Float, nullable=False) # 25%
    code_quality_reason = Column(Text, nullable=False)
    originality_score = Column(Float, nullable=False) # 15%
    originality_reason = Column(Text, nullable=False)
    presentation_score = Column(Float, nullable=False) # 10%
    presentation_reason = Column(Text, nullable=False)
    understanding_score = Column(Float, nullable=False) # 20%
    understanding_reason = Column(Text, nullable=False)
    security_findings = Column(JSON, default=list)
    evidence_snippets = Column(JSON, default=dict)

    score_run = relationship("ScoreRun", back_populates="breakdown")

class DefenseSession(Base):
    __tablename__ = "defense_sessions"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    score_run_id = Column(String(36), ForeignKey("score_runs.id", ondelete="CASCADE"), nullable=False)
    questions = Column(JSON, default=list) # 3 questions
    answers = Column(JSON, default=list)
    time_limit_seconds = Column(Integer, default=180)
    score = Column(Float, default=0.0)
    feedback_tone = Column(String(64), default="Supportive & Constructive")
    completed_at = Column(DateTime, nullable=True)

    score_run = relationship("ScoreRun", back_populates="defense_sessions")

class SkillPoint(Base):
    __tablename__ = "skill_points"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(64), nullable=False)
    points = Column(Integer, default=0)
    source_project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    source_score_run_id = Column(String(36), ForeignKey("score_runs.id", ondelete="SET NULL"), nullable=True)
    audit_reason = Column(String(256), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="skill_points")

class Post(Base):
    __tablename__ = "posts"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_type = Column(String(32), nullable=False) # SHOWCASE, UPCOMING, TEAM_CALL
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(256), nullable=False)
    body = Column(Text, nullable=False)
    skills_required = Column(JSON, default=list)
    roles_needed = Column(JSON, default=list)
    video_url = Column(String(512), nullable=True)
    subtitles_vtt = Column(Text, nullable=True)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="posts")
    risk_assessment = relationship("RiskAssessment", back_populates="post", uselist=False, cascade="all, delete-orphan")

class Flag(Base):
    __tablename__ = "flags"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    target_type = Column(String(32), nullable=False) # POST, PROJECT, USER
    target_id = Column(String(36), nullable=False)
    reason = Column(String(256), nullable=False)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(32), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

class Appeal(Base):
    __tablename__ = "appeals"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    score_run_id = Column(String(36), ForeignKey("score_runs.id", ondelete="CASCADE"), nullable=True)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    appellant_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    grounds = Column(Text, nullable=False)
    evidence_urls = Column(JSON, default=list)
    status = Column(String(32), default="QUEUED") # QUEUED, IN_REVIEW, ACCEPTED, REJECTED
    reviewer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ReviewQueueItem(Base):
    __tablename__ = "review_queue"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    item_type = Column(String(32), nullable=False) # POST_RED, PROJECT_SUSPECT, APPEAL, SCAM_REPORT
    item_id = Column(String(36), nullable=False)
    priority = Column(String(16), default="MEDIUM") # CRITICAL, HIGH, MEDIUM
    risk_score = Column(Float, default=0.0)
    assigned_to = Column(String(64), default="Trust & Safety Specialist")
    status = Column(String(32), default="QUEUED")
    created_at = Column(DateTime, default=datetime.utcnow)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    risk_score = Column(Float, nullable=False) # 0-100
    risk_band = Column(String(16), nullable=False) # GREEN, AMBER, RED
    decision = Column(String(16), nullable=False) # ALLOW, FLAG_WARNING, BLOCK
    triggered_rules = Column(JSON, default=list)
    evidence_spans = Column(JSON, default=list)
    multilingual_explanation = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="risk_assessment")

class ScamReport(Base):
    __tablename__ = "scam_reports"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    suspect_handle = Column(String(64), nullable=False)
    suspect_upi = Column(String(128), nullable=False)
    solicited_amount = Column(Float, nullable=True)
    evidence_text = Column(Text, nullable=False)
    cybercrime_dossier = Column(Text, nullable=False)
    status = Column(String(32), default="CONFIRMED")
    confirmed_at = Column(DateTime, default=datetime.utcnow)

class VerifiedEmployer(Base):
    __tablename__ = "verified_employers"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(256), nullable=False)
    domain = Column(String(256), nullable=False, unique=True)
    cin_gst = Column(String(64), nullable=False)
    tier = Column(String(32), default="TIER_1_VERIFIED")
    safety_guideline = Column(Text, nullable=False)
    last_snapshot_date = Column(String(32), default="2026-01-15")

class Group(Base):
    __tablename__ = "groups"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(256), nullable=False)
    origin_team_call_id = Column(String(36), ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    members = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("Message", back_populates="group", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    group_id = Column(String(36), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    original_text = Column(Text, nullable=False)
    detected_language = Column(String(10), default="en")
    payment_intercept_flag = Column(Boolean, default=False)
    intercepted_upi = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("Group", back_populates="messages")

class TranslationCache(Base):
    __tablename__ = "translations_cache"
    text_hash = Column(String(64), primary_key=True)
    target_language = Column(String(10), primary_key=True)
    translated_text = Column(Text, nullable=False)
    model_version = Column(String(32), default="indic-trans-v2-mock")
    created_at = Column(DateTime, default=datetime.utcnow)
