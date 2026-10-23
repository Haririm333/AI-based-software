"""
REET AI Idea Coach Router
Provides non-intrusive structured guidance on Upcoming project drafts.
"""

from fastapi import APIRouter
from typing import Dict, Any
from apps.api.services.idea_coach import idea_coach_service

router = APIRouter(prefix="/api/v1/coach", tags=["Idea Coach"])

@router.post("/evaluate-draft")
async def evaluate_draft(payload: Dict[str, str]):
    """Evaluates Upcoming post draft and returns ordered milestone steps and similar projects."""
    title = payload.get("title", "")
    body = payload.get("body", "")
    return idea_coach_service.evaluate_draft(title, body)
