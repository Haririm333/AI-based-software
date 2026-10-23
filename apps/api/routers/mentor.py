"""
REET Mentor Router
Delivers grounded coaching, repair instructions, and practice tasks in 5 languages.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any
from apps.api.services.mentor import mentor_service
from apps.api.routers.scoring import SCORE_RUNS_CACHE

router = APIRouter(prefix="/api/v1/mentor", tags=["Mentor"])

@router.get("/advice/{score_run_id}")
async def get_mentor_advice(
    score_run_id: str,
    lang: str = Query("en", description="Target language: ta, hi, te, ml, en")
):
    """Returns grounded coaching for a project's scoring run."""
    run = next((r for r in SCORE_RUNS_CACHE.values() if r["id"] == score_run_id or r["version_id"] == score_run_id), None)
    breakdown = run.get("breakdown", {}) if run else {}
    score = run.get("overall_score", 7.2) if run else 7.2

    advice = mentor_service.get_advice_for_score_run(breakdown, language=lang, overall_score=score)
    return advice
