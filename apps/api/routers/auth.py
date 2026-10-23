"""
REET Auth Router
Supports deterministic offline mock authentication across the 14 seed student accounts.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from apps.api.database import get_db
from apps.api.models import User
from apps.api.schemas import UserOut
from packages.shared.seed_data import USERS

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

# In-memory active session for offline hackathon convenience
CURRENT_USER_ID = "usr-01"

@router.get("/users", response_model=List[UserOut])
async def list_available_users(db: AsyncSession = Depends(get_db)):
    """Lists all 14 seed student accounts for rapid demo switching."""
    result = await db.execute(select(User))
    users = result.scalars().all()
    if not users:
        # Fallback to seed data directly if DB is empty
        return [
            UserOut(
                id=u["id"],
                username=u["username"],
                full_name=u["full_name"],
                college=u["college"],
                state=u["state"],
                preferred_language=u["preferred_language"],
                trust_quotient=u["trust_quotient"],
                safety_skill_earned=u["safety_skill_earned"],
                safety_badge_hash=u.get("safety_badge_hash"),
                avatar=u.get("avatar", "👨‍💻"),
                created_at="2026-01-15T00:00:00Z",
                skills=u.get("skills", {})
            ) for u in USERS
        ]
    return users

@router.post("/mock-login/{user_id}", response_model=UserOut)
async def mock_login(user_id: str, db: AsyncSession = Depends(get_db)):
    """Switches active demo user session."""
    global CURRENT_USER_ID
    target = next((u for u in USERS if u["id"] == user_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Student account not found in seed registry.")
    
    CURRENT_USER_ID = user_id
    return UserOut(
        id=target["id"],
        username=target["username"],
        full_name=target["full_name"],
        college=target["college"],
        state=target["state"],
        preferred_language=target["preferred_language"],
        trust_quotient=target["trust_quotient"],
        safety_skill_earned=target["safety_skill_earned"],
        safety_badge_hash=target.get("safety_badge_hash"),
        avatar=target.get("avatar", "👨‍💻"),
        created_at="2026-01-15T00:00:00Z",
        skills=target.get("skills", {})
    )

@router.get("/me", response_model=UserOut)
async def get_current_user():
    """Returns the currently active student session."""
    target = next((u for u in USERS if u["id"] == CURRENT_USER_ID), USERS[0])
    return UserOut(
        id=target["id"],
        username=target["username"],
        full_name=target["full_name"],
        college=target["college"],
        state=target["state"],
        preferred_language=target["preferred_language"],
        trust_quotient=target["trust_quotient"],
        safety_skill_earned=target["safety_skill_earned"],
        safety_badge_hash=target.get("safety_badge_hash"),
        avatar=target.get("avatar", "👨‍💻"),
        created_at="2026-01-15T00:00:00Z",
        skills=target.get("skills", {})
    )
