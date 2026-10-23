"""
REET Scoring Pipeline Router
Handles async job triggering, execution states, cached commit-hash breakdowns,
and human review appeals.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
import asyncio

from apps.api.services.sandbox_runner import sandbox_runner
from apps.api.services.static_analyzer import static_analyzer
from apps.api.services.rubric_scorer import rubric_scorer
from apps.api.routers.projects import ACTIVE_PROJECTS
from packages.shared.seed_data import SAMPLE_REPOSITORIES

router = APIRouter(prefix="/api/v1/scoring", tags=["Scoring"])

# In-memory score runs cache by version_id
SCORE_RUNS_CACHE: Dict[str, Dict[str, Any]] = {}

# Pre-populate sample repositories into cache
for sample in SAMPLE_REPOSITORIES:
    v_id = f"ver-{sample['id']}"
    SCORE_RUNS_CACHE[v_id] = {
        "id": f"run-{sample['id']}",
        "version_id": v_id,
        "status": "COMPLETED",
        "overall_score": sample["reference_score"],
        "confidence": "LOW" if sample.get("sandbox_status") == "FAILED_FALLBACK_VIDEO" else "HIGH",
        "sandbox_executed": sample.get("sandbox_status") != "FAILED_FALLBACK_VIDEO",
        "sandbox_fallback_reason": "Fell back to demo video review" if sample.get("sandbox_status") == "FAILED_FALLBACK_VIDEO" else None,
        "prompt_injection_flagged": sample.get("has_injection", False),
        "prompt_injection_penalty": sample.get("injection_penalty", 0.0),
        "breakdown": {
            "works_score": sample["breakdown"]["works"],
            "works_reason": sample["breakdown"]["works_reason"],
            "code_quality_score": sample["breakdown"]["code_quality"],
            "code_quality_reason": sample["breakdown"]["code_quality_reason"],
            "originality_score": sample["breakdown"]["originality"],
            "originality_reason": sample["breakdown"]["originality_reason"],
            "presentation_score": sample["breakdown"]["presentation"],
            "presentation_reason": sample["breakdown"]["presentation_reason"],
            "understanding_score": sample["breakdown"]["understanding"],
            "understanding_reason": sample["breakdown"]["understanding_reason"],
            "security_findings": sample.get("security_findings", []),
            "evidence_snippets": {"sample_id": sample["id"]}
        }
    }

async def execute_scoring_pipeline(version_id: str, repo_info: Dict[str, Any]):
    """Async background worker task simulating multi-stage verification pipeline."""
    # Step 1: Sandboxing
    SCORE_RUNS_CACHE[version_id]["status"] = "SANDBOXING"
    await asyncio.sleep(0.5)
    sandbox_result = await sandbox_runner.execute(repo_info)

    # Step 2: Static Analysis
    SCORE_RUNS_CACHE[version_id]["status"] = "ANALYZING"
    await asyncio.sleep(0.4)
    static_result = await static_analyzer.analyze(repo_info)

    # Step 3: Rubric & Injection Scoring
    SCORE_RUNS_CACHE[version_id]["status"] = "SCORING"
    await asyncio.sleep(0.4)
    scored = await rubric_scorer.score_project(
        repo_info=repo_info,
        sandbox_result=sandbox_result,
        static_result=static_result,
        code_defense_score=8.5
    )

    # Finalize
    SCORE_RUNS_CACHE[version_id].update({
        "status": "COMPLETED",
        "overall_score": scored["overall_score"],
        "confidence": scored["confidence"],
        "sandbox_executed": sandbox_result.get("executed", True),
        "sandbox_fallback_reason": sandbox_result.get("fallback_reason"),
        "prompt_injection_flagged": scored["prompt_injection_flagged"],
        "prompt_injection_penalty": scored["prompt_injection_penalty"],
        "breakdown": scored["breakdown"],
        "security_findings": scored["security_findings"],
        "evidence_snippets": scored["evidence_snippets"]
    })

    # Update parent project if present
    for proj in ACTIVE_PROJECTS.values():
        if proj.get("latest_version_id") == version_id:
            proj["latest_score"] = scored["overall_score"]

@router.post("/trigger/{version_id}")
async def trigger_scoring_pipeline(version_id: str, background_tasks: BackgroundTasks):
    """Enqueues async scoring pipeline for a project commit version."""
    # Find repository context
    repo_info = None
    for proj in ACTIVE_PROJECTS.values():
        if proj.get("latest_version_id") == version_id:
            repo_info = proj.get("repo_data")
            break

    if not repo_info:
        # Check sample repositories
        sample = next((s for s in SAMPLE_REPOSITORIES if f"ver-{s['id']}" == version_id or s["id"] == version_id), None)
        if sample:
            repo_info = {"sample_meta": sample, "title": sample["title"], "description": sample["description"]}
        else:
            repo_info = {"title": "Campus Project", "description": "Python Flask application"}

    SCORE_RUNS_CACHE[version_id] = {
        "id": f"run-{version_id}",
        "version_id": version_id,
        "status": "QUEUED",
        "overall_score": None,
        "confidence": "HIGH",
        "breakdown": None
    }

    background_tasks.add_task(execute_scoring_pipeline, version_id, repo_info)
    return {"status": "QUEUED", "version_id": version_id, "message": "Scoring pipeline job initiated."}

@router.get("/status/{version_id}")
async def get_scoring_status(version_id: str):
    """Returns live pipeline progress status."""
    run = SCORE_RUNS_CACHE.get(version_id)
    if not run:
        raise HTTPException(status_code=404, detail="Score run not found.")
    return {"status": run["status"], "version_id": version_id, "overall_score": run.get("overall_score")}

@router.get("/breakdown/{version_id}")
async def get_scoring_breakdown(version_id: str):
    """Returns the cached 5-category breakdown and evidence."""
    run = SCORE_RUNS_CACHE.get(version_id)
    if not run:
        raise HTTPException(status_code=404, detail="Score run not found.")
    return run

@router.post("/appeal")
async def submit_score_appeal(payload: Dict[str, Any]):
    """Allows student to submit an appeal to the human review queue."""
    appeal_id = f"appeal-{len(SCORE_RUNS_CACHE) + 1:03d}"
    return {
        "appeal_id": appeal_id,
        "status": "QUEUED",
        "message": "Appeal logged for human reviewer triage. Average resolution time: 2 hours."
    }

@router.post("/resubmit")
async def resubmit_improved_project(payload: Dict[str, Any]):
    """
    Simulates resubmitting fixed code.
    Calculates before/after category scores and returns growth chart metrics.
    Growth is highlighted more prominently than raw scores.
    """
    version_id = payload.get("version_id", "ver-repo-01")
    old_run = SCORE_RUNS_CACHE.get(version_id) or SCORE_RUNS_CACHE.get("ver-repo-01")
    old_score = old_run.get("overall_score", 6.8) if old_run else 6.8
    new_score = min(9.5, round(old_score + 1.8, 1))

    growth_data = {
        "project_id": payload.get("project_id", "repo-01"),
        "version_before": version_id,
        "version_after": f"{version_id}-v2",
        "score_before": old_score,
        "score_after": new_score,
        "overall_growth_delta": round(new_score - old_score, 1),
        "category_growth": [
            {"category": "Works (30%)", "before": 6.5, "after": 9.2, "delta": +2.7},
            {"category": "Code Quality (25%)", "before": 6.8, "after": 8.8, "delta": +2.0},
            {"category": "Originality (15%)", "before": 7.5, "after": 8.0, "delta": +0.5},
            {"category": "Presentation (10%)", "before": 8.0, "after": 9.0, "delta": +1.0},
            {"category": "Understanding (20%)", "before": 7.0, "after": 9.2, "delta": +2.2}
        ],
        "mentor_endorsement_awarded": True,
        "points_delta": int((new_score - old_score) * 25)
    }
    return growth_data
