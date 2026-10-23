"""
REET Trust Shield Router
Complete student scam prevention, verified registry, and cybercrime reporting endpoints.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from apps.api.services.risk_scorer import risk_scorer_service
from apps.api.services.claim_verifier import claim_verifier, VERIFIED_REGISTRY
from apps.api.services.payment_guard import payment_guard_service
from apps.api.services.report_builder import report_builder_service
from apps.api.services.scam_alerts import scam_alerts_service
from packages.shared.seed_data import USERS

router = APIRouter(prefix="/api/v1/trust", tags=["Trust Shield"])

@router.post("/scan")
async def scan_content_risk(payload: Dict[str, Any]):
    """Pre-publish risk assessment returning 0-100 score, band, and multilingual reasons."""
    text = payload.get("text", "")
    domain = payload.get("domain")
    lang = payload.get("language_code", "en")
    return risk_scorer_service.score_content(text, domain=domain, language_code=lang)

@router.get("/verified-employers")
async def get_verified_employers():
    """Returns the 15 verified statutory employers and portal registry."""
    return {
        "snapshot_date": claim_verifier.snapshot_date,
        "total": len(VERIFIED_REGISTRY),
        "registry": VERIFIED_REGISTRY
    }

@router.get("/alerts")
async def get_scam_alerts_and_rumors():
    """Returns community threat alerts and the 6 fact-checked viral rumors."""
    return {
        "viral_rumors": scam_alerts_service.get_all_rumors()
    }

@router.post("/report-scam")
async def report_scam_and_award_safety_skill(payload: Dict[str, Any]):
    """
    Builds pre-filled cybercrime.gov.in complaint dossier and awards the 'Safety' skill
    plus Safety Sentinel credential badge upon confirmation.
    """
    reporter_id = payload.get("reporter_id", "usr-01")
    suspect_handle = payload.get("suspect_handle", "@google_placement_agent")
    suspect_upi = payload.get("suspect_upi", "google.hr.recruitment@okicici")
    evidence_text = payload.get("evidence_text", "Pay ₹2,000 to google.hr.recruitment@okicici to confirm internship.")

    reporter = next((u for u in USERS if u["id"] == reporter_id), USERS[0])

    dossier = report_builder_service.build_complaint_dossier(
        reporter_handle=f"@{reporter['username']}",
        suspect_handle=suspect_handle,
        suspect_upi=suspect_upi,
        evidence_text=evidence_text
    )

    # Award "Safety" skill and increase Trust Quotient (+20)
    reporter["safety_skill_earned"] = True
    reporter["safety_badge_hash"] = dossier["proof_point_reward"]["verification_hash"]
    reporter["trust_quotient"] = min(98, reporter.get("trust_quotient", 60) + 20)
    if "skills" in reporter:
        reporter["skills"]["Safety"] = 100

    return {
        "status": "CONFIRMED",
        "dossier": dossier,
        "reporter_updated": reporter
    }

@router.get("/demo-step4")
async def get_demo_step4_data():
    """Returns the exact 45-second Trust Shield sequence (Step 4a, 4b, 4c)."""
    # 4a: Fake post blocked with score 92 & Tamil reasons
    post_text = "Google internship, pay ₹2,000 to confirm your seat."
    eval_4a = risk_scorer_service.score_content(post_text, language_code="ta")

    # 4b: Scammer DM with UPI ID
    dm_text = "Congratulations! To confirm your intern seat, send ₹2,000 to google.hr.recruitment@okicici right now."
    eval_4b = payment_guard_service.inspect_message(dm_text)

    # 4c: Dossier & 1930 Helpline
    dossier = report_builder_service.build_complaint_dossier(
        reporter_handle="@hariram_tech",
        suspect_handle="@google_placement_agent",
        suspect_upi="google.hr.recruitment@okicici",
        evidence_text=dm_text
    )

    return {
        "step_4a": eval_4a,
        "step_4b": eval_4b,
        "step_4c": dossier
    }
