"""
REET Profile & Proof Points Router
Calculates verified skill levels using the anti-inflation formula:
Level = floor(sqrt(EffectivePoints / 100)) + 1
Provides segmented skill bars and 'how you earned this' audit history.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from apps.api.services.level_calculator import level_calculator
from packages.shared.seed_data import USERS, SAMPLE_REPOSITORIES

router = APIRouter(prefix="/api/v1/profile", tags=["Profile & Proof Points"])

@router.get("/{user_id}")
async def get_user_proof_profile(user_id: str):
    """Returns student's verified skills, levels, and project audit history."""
    user = next((u for u in USERS if u["id"] == user_id or u["username"] == user_id), USERS[0])

    # Find verified projects for this user
    user_repos = [r for r in SAMPLE_REPOSITORIES if r["owner"] == user["username"]]
    scores = [r["reference_score"] for r in user_repos] or [9.3, 8.5]

    # Calculate skill levels
    skill_breakdown = {}
    for skill_name, raw_points in user.get("skills", {}).items():
        calc = level_calculator.calculate_effective_skill_level(
            project_scores=scores,
            collab_count=1,
            mentor_endorsements=1,
            likes_count=15 # Will be capped at 10
        )
        skill_breakdown[skill_name] = {
            "points": raw_points,
            "level": calc["level"],
            "progress_to_next_level_pct": calc["progress_to_next_level_pct"],
            "top_5_projects_counted": calc["projects_counted_top5"]
        }

    # "How you earned this" audit ledger history
    audit_history = []
    for r in user_repos:
        audit_history.append({
            "project_id": r["id"],
            "project_title": r["title"],
            "score": r["reference_score"],
            "points_earned": level_calculator.calculate_project_skill_points(r["reference_score"]),
            "skill": r["primary_language"],
            "verified_date": "2026-10-20"
        })

    if user.get("safety_skill_earned"):
        audit_history.append({
            "project_id": "ts-scam-report-01",
            "project_title": "Confirmed UPI Scam Intercept (@google_placement_agent)",
            "score": 10.0,
            "points_earned": 100,
            "skill": "Safety",
            "verified_date": "2026-10-23"
        })

    return {
        "user": user,
        "skills": skill_breakdown,
        "audit_history": audit_history,
        "anti_inflation_policy": "Level uses the best 5 projects only. 50 trivial projects cannot beat 5 rigorous systems."
    }
