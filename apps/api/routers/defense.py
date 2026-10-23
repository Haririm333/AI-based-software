"""
REET Defense Router
Manages 3-question timed Code Defense sessions.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from apps.api.services.code_defense import code_defense_service
from apps.api.routers.scoring import SCORE_RUNS_CACHE

router = APIRouter(prefix="/api/v1/defense", tags=["Code Defense"])

@router.post("/start/{score_run_id}")
async def start_defense_session(score_run_id: str):
    """Generates a 3-question timed defense session grounded in repository code."""
    session = code_defense_service.generate_defense_session(score_run_id)
    return session

@router.post("/submit")
async def submit_defense_answers(payload: Dict[str, Any]):
    """Evaluates student answers, computes Understanding score, and updates score run."""
    session_id = payload.get("session_id")
    answers = payload.get("answers", [])
    result = code_defense_service.evaluate_answers(session_id, answers)
    
    # Update score run if session exists
    session = code_defense_service.active_sessions.get(session_id)
    if session:
        score_run_id = session.get("score_run_id")
        run = next((r for r in SCORE_RUNS_CACHE.values() if r["id"] == score_run_id), None)
        if run and run.get("breakdown"):
            run["breakdown"]["understanding_score"] = result["score"]
            run["breakdown"]["understanding_reason"] = result["summary"]

    return result
