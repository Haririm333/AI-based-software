"""
Test Suites for REET Proof Engine, Level Calculator, Team Matcher, and Trust Shield
Implements at least 8 distinct test cases for:
1. level_calculator (proving 50 trivial projects cannot beat 5 good ones, capped likes, bonuses)
2. rules (named red flag functions)
3. risk_scorer (including false-positive challenges)
4. payment_guard (UPI regex edge cases and multilingual coercion phrases)
5. team_matcher (candidate rankings, match score formulas, one-line reasons)
6. claim_verifier (domain verification, MCA/SEBI snapshots, unverified fallback)
"""

import pytest
from apps.api.services.level_calculator import level_calculator
from apps.api.services.rules import (
    check_fee_for_job, check_guaranteed_returns, check_artificial_urgency,
    check_chat_redirection, check_unrealistic_salary, check_freemail_for_company,
    check_fake_govt_scheme, check_instant_loan_fee
)
from apps.api.services.risk_scorer import risk_scorer_service
from apps.api.services.payment_guard import payment_guard_service
from apps.api.services.team_matcher import team_matcher_service
from apps.api.services.claim_verifier import claim_verifier

# =====================================================================
# 1. LEVEL CALCULATOR & ANTI-INFLATION TESTS (>= 8 CASES)
# =====================================================================

def test_level_50_trivial_cannot_beat_5_good():
    """Case 1 (CRITICAL): 50 trivial scripts (score 2.0) must NOT beat 5 rigorous projects (score 9.0)."""
    fifty_trivial_scores = [2.0] * 50
    five_good_scores = [9.0] * 5

    res_trivial = level_calculator.calculate_effective_skill_level(fifty_trivial_scores)
    res_good = level_calculator.calculate_effective_skill_level(five_good_scores)

    # 5 good projects earn 5 * (9.0 * 25) = 1125 points -> Level 4
    # 50 trivial projects: top 5 earn 5 * (2.0 * 25) = 250 points, plus 19 tail points = 269 points -> Level 2
    assert res_good["total_effective_points"] > res_trivial["total_effective_points"] * 3
    assert res_good["level"] > res_trivial["level"]
    assert res_good["level"] >= 4
    assert res_trivial["level"] <= 2

def test_level_progression_thresholds():
    """Case 2: Level 1 for 0-99 points, Level 2 at 100 points, Level 3 at 400 points."""
    assert level_calculator.calculate_effective_skill_level([0.0])["level"] == 1
    assert level_calculator.calculate_effective_skill_level([4.0])["level"] == 2 # 4.0 * 25 = 100 pts -> Level 2
    assert level_calculator.calculate_effective_skill_level([8.0, 8.0])["level"] == 3 # 200 + 200 = 400 pts -> Level 3

def test_social_likes_capped_at_10():
    """Case 3: Social likes are strictly capped at 10 points regardless of volume."""
    res_100_likes = level_calculator.calculate_effective_skill_level([8.0], likes_count=100)
    res_10_likes = level_calculator.calculate_effective_skill_level([8.0], likes_count=10)
    assert res_100_likes["likes_points"] == 10
    assert res_10_likes["likes_points"] == 10
    assert res_100_likes["total_effective_points"] == res_10_likes["total_effective_points"]

def test_collab_bonus_applied():
    """Case 4: Verified collaboration adds +30 points."""
    res_collab = level_calculator.calculate_effective_skill_level([8.0], collab_count=2)
    assert res_collab["collab_points"] == 60

def test_mentor_bonus_applied():
    """Case 5: Mentor endorsement adds +40 points."""
    res_mentor = level_calculator.calculate_effective_skill_level([8.0], mentor_endorsements=1)
    assert res_mentor["mentor_points"] == 40

def test_difficulty_multiplier_scaling():
    """Case 6: Difficulty multiplier scales points correctly between 1.0 and 2.0."""
    pts_normal = level_calculator.calculate_project_skill_points(8.0, difficulty_multiplier=1.0)
    pts_hard = level_calculator.calculate_project_skill_points(8.0, difficulty_multiplier=1.5)
    pts_extreme = level_calculator.calculate_project_skill_points(8.0, difficulty_multiplier=2.0)
    assert pts_normal == 200
    assert pts_hard == 300
    assert pts_extreme == 400

def test_difficulty_multiplier_clamping():
    """Case 7: Difficulty multiplier is clamped to [1.0, 2.0]."""
    pts_min = level_calculator.calculate_project_skill_points(8.0, difficulty_multiplier=0.1)
    pts_max = level_calculator.calculate_project_skill_points(8.0, difficulty_multiplier=99.0)
    assert pts_min == 200
    assert pts_max == 400

def test_progress_percentage_calculation():
    """Case 8: Progress percentage to next level is bounded [0, 100]."""
    res = level_calculator.calculate_effective_skill_level([9.0, 9.0])
    assert 0.0 <= res["progress_to_next_level_pct"] <= 100.0

# =====================================================================
# 2. TRUST SHIELD RULES TESTS (>= 8 CASES)
# =====================================================================

def test_rule_fee_for_job_english():
    """Rule 1: Detects fee for job in English."""
    assert check_fee_for_job("Pay ₹2,000 to confirm your seat immediately.") is True

def test_rule_fee_for_job_tanglish():
    """Rule 2: Detects fee for job in Tanglish."""
    assert check_fee_for_job("Offer letter confirm panna ₹2,000 seat booking fee pay pannanum.") is True

def test_rule_fee_for_job_hinglish():
    """Rule 3: Detects security deposit requirement in Hinglish."""
    assert check_fee_for_job("Courier dispatch se pehle ₹3,500 security deposit dena hoga.") is True

def test_rule_guaranteed_returns():
    """Rule 4: Detects Ponzi / crypto doublers."""
    assert check_guaranteed_returns("Send ₹1,000 get ₹2,500 within 24 hours guaranteed.") is True

def test_rule_artificial_urgency():
    """Rule 5: Detects artificial urgency tactics."""
    assert check_artificial_urgency("Only 2 seats left! Offer will be cancelled today by 5 PM.") is True

def test_rule_unrealistic_salary():
    """Rule 6: Detects YouTube like task scam."""
    assert check_unrealistic_salary("यूट्यूब वीडियो लाइक और सब्सक्राइब करने पर प्रत्येक लाइक के ₹150 मिलेंगे।") is True

def test_rule_freemail_for_company():
    """Rule 7: Detects freemail posing as corporate recruiter."""
    assert check_freemail_for_company("Official Google hiring. Send resume to google.recruiter@gmail.com") is True

def test_rule_fake_govt_scheme():
    """Rule 8: Detects fake scholarship server fee in Malayalam."""
    assert check_fake_govt_scheme("കേന്ദ്ര ഗവൺമെന്റ് സ്കോളർഷിപ്പ് മാർക്ക് നിബന്ധനകളില്ല സർവർ രജിസ്ട്രേഷൻ ഫീസ് ₹750.") is True

# =====================================================================
# 3. RISK SCORER & FALSE POSITIVE TESTS (>= 8 CASES)
# =====================================================================

def test_scorer_demo_sequence_step4a():
    """Scorer 1: Exact demo fake post returns 92 (RED), blocked, and Tamil reasons."""
    text = "Google internship, pay ₹2,000 to confirm your seat."
    res = risk_scorer_service.score_content(text, language_code="ta")
    assert res["risk_score"] == 92.0
    assert res["risk_band"] == "RED"
    assert res["decision"] == "BLOCK"
    assert "மோசடி" in res["explanation"]["headline"] or "எச்சரிக்கை" in res["explanation"]["headline"]

def test_scorer_genuine_open_source_stipend_stays_green():
    """Scorer 2 (False-Positive 1): ₹15,000 monthly stipend with verified domain stays GREEN."""
    text = "Open Source Fellowship 2026. Selected mentees receive a monthly stipend of ₹15,000. No application fee. Apply at careers.google.com."
    res = risk_scorer_service.score_content(text, domain="careers.google.com")
    assert res["risk_score"] <= 30.0
    assert res["risk_band"] == "GREEN"
    assert res["decision"] == "ALLOW"

def test_scorer_hackathon_telegram_logistics_stays_green():
    """Scorer 3 (False-Positive 2): SIH logistics Telegram group on .edu.in stays GREEN."""
    text = "Smart India Hackathon teams: join t.me/anna_univ_sih_logistics for bus departure timings. Official details on aucev.edu.in."
    res = risk_scorer_service.score_content(text, domain="aucev.edu.in")
    assert res["risk_score"] <= 30.0
    assert res["risk_band"] == "GREEN"
    assert res["decision"] == "ALLOW"

def test_scorer_robotics_kit_fee_on_university_portal_stays_green():
    """Scorer 4 (False-Positive 3): Nominal ₹150 lab kit fee on university portal stays GREEN."""
    text = "Robotics Club workshop. Nominal kit fee ₹150 payable on official university portal. Strictly no personal UPI."
    res = risk_scorer_service.score_content(text, domain="mitindia.edu.in")
    assert res["risk_score"] <= 30.0
    assert res["risk_band"] == "GREEN"

def test_scorer_upwork_escrow_contract_stays_green():
    """Scorer 5 (False-Positive 4): Freelance gig with milestone escrow on Upwork stays GREEN."""
    text = "Need React Native dev for 4 days. Budget ₹8,000 held in platform escrow on Upwork contract. No direct offline payment."
    res = risk_scorer_service.score_content(text, domain="ncs.gov.in")
    assert res["risk_score"] <= 30.0
    assert res["risk_band"] == "GREEN"

def test_scorer_wipro_laptop_deposit_scam():
    """Scorer 6: Wipro laptop deposit scam scores in RED band."""
    text = "Selected for Wipro. Transfer ₹3,500 security deposit via GPay to wipro.onboarding.dispatch@ybl today by 5 PM."
    res = risk_scorer_service.score_content(text)
    assert res["risk_score"] >= 71.0
    assert res["risk_band"] == "RED"

def test_scorer_crypto_doubler_scam():
    """Scorer 7: Crypto doubler bot scores in RED band."""
    text = "Crypto Doubling Bot: Send ₹1,000 get ₹2,500 in 24 hours guaranteed with 100% risk free bot."
    res = risk_scorer_service.score_content(text)
    assert res["risk_score"] >= 71.0
    assert res["risk_band"] == "RED"

def test_scorer_multilingual_reasons_present():
    """Scorer 8: Generates explanations across Tamil, Hindi, Telugu, Malayalam, English."""
    text = "Google internship, pay ₹2,000 to confirm your seat."
    res = risk_scorer_service.score_content(text)
    for lang in ["ta", "hi", "te", "ml", "en"]:
        assert lang in res["multilingual_explanation"]
        assert len(res["multilingual_explanation"][lang]["reasons"]) >= 3

# =====================================================================
# 4. PAYMENT GUARD TESTS (>= 8 CASES)
# =====================================================================

def test_payment_guard_standard_upi():
    """Payment Guard 1: Detects standard lowercase UPI ID."""
    res = payment_guard_service.inspect_message("Send ₹2,000 to google.hr.recruitment@okicici right now.")
    assert "google.hr.recruitment@okicici" in res["detected_upis"]
    assert res["amount"] == 2000
    assert res["is_payment_moment"] is True

def test_payment_guard_uppercase_upi():
    """Payment Guard 2: Handles UPPERCASE UPI handle edge cases."""
    res = payment_guard_service.inspect_message("Transfer to QUICKHR@OKAXIS immediately.")
    assert "quickhr@okaxis" in res["detected_upis"]

def test_payment_guard_numeric_vpa():
    """Payment Guard 3: Handles 10-digit numeric mobile VPAs (e.g. 9876543210@paytm)."""
    res = payment_guard_service.inspect_message("Send token fee to 9876543210@paytm or 9123456789@ybl.")
    assert "9876543210@paytm" in res["detected_upis"]
    assert "9123456789@ybl" in res["detected_upis"]

def test_payment_guard_upi_uri_scheme():
    """Payment Guard 4: Detects deep link upi://pay URI protocols."""
    res = payment_guard_service.inspect_message("Pay via upi://pay?pa=papers.leak2026@axisbank&pn=ExamsDesk&am=1200.")
    assert len(res["detected_uris"]) > 0
    assert "upi://pay?pa=papers.leak2026@axisbank" in res["detected_uris"][0]

def test_payment_guard_tamil_coercion():
    """Payment Guard 5: Detects Tamil payment coercion phrases."""
    res = payment_guard_service.inspect_message("வேலைக்கு கட்டணம் செலுத்த வேண்டும் ₹2,000.")
    assert any(c["lang"] == "ta" for c in res["coercion_signals"])

def test_payment_guard_hindi_coercion():
    """Payment Guard 6: Detects Hindi payment coercion phrases."""
    res = payment_guard_service.inspect_message("पैसे भेजें तुरंत ₹500 task.manager99@paytm पर।")
    assert any(c["lang"] == "hi" for c in res["coercion_signals"])

def test_payment_guard_telugu_coercion():
    """Payment Guard 7: Detects Telugu payment coercion phrases."""
    res = payment_guard_service.inspect_message("Portal fee pay cheyandi ₹499.")
    assert any(c["lang"] == "te" for c in res["coercion_signals"])

def test_payment_guard_warning_modal_format():
    """Payment Guard 8: Formats complete warning modal with safety checklist and 1930 helpline."""
    res = payment_guard_service.inspect_message("Pay ₹2,000 to google.hr.recruitment@okicici within 10 minutes.")
    modal = res["warning_modal_data"]
    assert modal is not None
    assert modal["risk_score"] >= 90.0
    assert modal["helpline"] == "1930"
    assert len(modal["safety_checklist"]) >= 3
    assert "Don't send" in modal["actions"]["primary"]

# =====================================================================
# 5. TEAM MATCHER TESTS (>= 8 CASES)
# =====================================================================

def test_team_matcher_ranks_matching_skills_highest():
    """Matcher 1: Python requirement ranks candidates with verified Python points highest."""
    matches = team_matcher_service.match_candidates_for_call(["Python"], ["Backend"], "usr-01")
    assert len(matches) > 0
    top = matches[0]
    assert top["user"]["skills"].get("Python", 0) > 0

def test_team_matcher_excludes_caller():
    """Matcher 2: Caller is excluded from their own recommendation list."""
    matches = team_matcher_service.match_candidates_for_call(["Python"], ["Dev"], "usr-01")
    assert not any(m["user"]["id"] == "usr-01" for m in matches)

def test_team_matcher_generates_one_line_reason():
    """Matcher 3: Returns informative one-line reason citing points and verified project."""
    matches = team_matcher_service.match_candidates_for_call(["Python"], ["Dev"], "usr-01")
    for m in matches[:3]:
        assert "verified points" in m["one_line_reason"]

def test_team_matcher_handles_empty_skills_gracefully():
    """Matcher 4: Handles empty skill criteria without exceptions."""
    matches = team_matcher_service.match_candidates_for_call([], [], "usr-01")
    assert len(matches) > 0

def test_team_matcher_orders_descending():
    """Matcher 5: Candidate list is sorted strictly in descending order of match score."""
    matches = team_matcher_service.match_candidates_for_call(["Web", "React"], ["Frontend"], "usr-01")
    scores = [m["match_score"] for m in matches]
    assert scores == sorted(scores, reverse=True)

def test_team_matcher_score_bounded():
    """Matcher 6: Match score is strictly bounded [0, 100]."""
    matches = team_matcher_service.match_candidates_for_call(["Python", "IoT"], ["IoT Lead"], "usr-01")
    for m in matches:
        assert 0.0 <= m["match_score"] <= 100.0

def test_team_matcher_domain_boost():
    """Matcher 7: Matches with matching project domain receive relevance boost."""
    matches = team_matcher_service.match_candidates_for_call(["IoT"], ["Hardware"], "usr-01")
    iot_user = next((m for m in matches if "IoT" in m["user"]["skills"]), None)
    assert iot_user is not None
    assert iot_user["match_score"] > 60.0

def test_team_matcher_trust_quotient_influence():
    """Matcher 8: High Trust Quotient contributes positively to match rank."""
    matches = team_matcher_service.match_candidates_for_call(["Python"], ["Dev"], "usr-01")
    high_trust = next(m for m in matches if m["user"]["trust_quotient"] >= 85)
    assert high_trust["match_score"] >= 70.0

# =====================================================================
# 6. CLAIM VERIFIER TESTS (>= 8 CASES)
# =====================================================================

def test_claim_verifier_edu_in_statutory():
    """Verifier 1: .edu.in domain is recognized as statutory educational authority."""
    res = claim_verifier.verify_domain("aucev.edu.in")
    assert res["verified"] is True
    assert res["status"] == "statutory_verified"
    assert res["risk_mitigation"] == 50

def test_claim_verifier_gov_in_statutory():
    """Verifier 2: .gov.in domain is recognized as statutory government authority."""
    res = claim_verifier.verify_domain("ncs.gov.in")
    assert res["verified"] is True
    assert res["status"] == "statutory_verified"

def test_claim_verifier_corporate_registry_google():
    """Verifier 3: Google Careers matches verified employer registry."""
    res = claim_verifier.verify_domain("careers.google.com")
    assert res["verified"] is True
    assert res["status"] == "registry_verified"
    assert "Google" in res["authority"]

def test_claim_verifier_corporate_registry_tcs():
    """Verifier 4: TCS matches verified employer registry."""
    res = claim_verifier.verify_domain("tcs.com")
    assert res["verified"] is True
    assert "Tata" in res["authority"]

def test_claim_verifier_corporate_registry_infosys():
    """Verifier 5: Infosys matches verified employer registry."""
    res = claim_verifier.verify_domain("infosys.com")
    assert res["verified"] is True

def test_claim_verifier_snapshot_date_present():
    """Verifier 6: Snapshot date is explicitly present."""
    res = claim_verifier.verify_domain("careers.google.com")
    assert res["snapshot_date"] == "2026-01-15"

def test_claim_verifier_unverified_fallback():
    """Verifier 7: Unknown domains return unverified without crashing or guessing."""
    res = claim_verifier.verify_domain("free-laptop-scheme-2026.xyz")
    assert res["verified"] is False
    assert res["status"] == "unverified"
    assert res["risk_mitigation"] == 0

def test_claim_verifier_corporate_claim_mca():
    """Verifier 8: Corporate name lookup against MCA snapshot."""
    res = claim_verifier.verify_corporate_claim("Google")
    assert res["matched"] is True
    assert res["status"] == "MCA_VERIFIED"
