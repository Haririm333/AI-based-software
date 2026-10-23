"""
REET Trust Shield Layer 2: Red-Flag Heuristic Rules
Small, tested, named rule functions detecting money-loss patterns in 5 languages:
Tamil, Hindi, Telugu, Malayalam, English and Tanglish/Hinglish.
"""

import re
from typing import Dict, Any, List

def check_fee_for_job(text: str) -> bool:
    """Detects fee/registration/deposit requests for jobs or internships."""
    patterns = [
        r"(?:pay|transfer|send|deposit)\s*(?:₹|rs\.?|inr)?\s*[\d,]+\s*(?:to\s*confirm|for\s*seat|booking\s*fee|registration\s*fee|security\s*deposit)",
        r"(?:fee|kattanam|panam|rupaye|paise|deposit)\s*(?:pay|katti|dena|kattavum|transfer)",
        r"seat\s*booking\s*fee",
        r"seat\s*confirm\s*panna",
        r"security\s*deposit",
        r"laptop\s*(?:deposit|security|courier\s*fee|insurance)",
        r"onboarding\s*(?:fee|deposit|charge)"
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

def check_guaranteed_returns(text: str) -> bool:
    """Detects Ponzi / crypto doublers / unrealistic guaranteed returns."""
    patterns = [
        r"send\s*₹?[\d,]+\s*get\s*₹?[\d,]+",
        r"\d+%\s*returns?\s*in\s*\d+\s*(?:hours|days)\s*guaranteed",
        r"crypto\s*doubling\s*bot",
        r"forex\s*(?:ai\s*)?student\s*(?:auto-trader|pool)",
        r"daily\s*\d+%\s*(?:profit|dividend)",
        r"100%\s*risk\s*free",
        r"doubl(?:ing|er)\s*bot"
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

def check_artificial_urgency(text: str) -> bool:
    """Detects psychological pressure cues."""
    patterns = [
        r"only\s*\d+\s*seats?\s*left",
        r"within\s*\d+\s*(?:mins|minutes|hours)",
        r"immediately|urgently|right\s*now|turant|udanadi|urgent",
        r"today\s*by\s*\d+\s*(?:pm|am)",
        r"offer\s*will\s*be\s*cancelled",
        r"vera\s*aaluku\s*kuduthuduvom",
        r"demand\s*bahut\s*high\s*hai"
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

def check_chat_redirection(text: str) -> bool:
    """Detects suspicious redirection to unmonitored WhatsApp or Telegram for recruitment."""
    patterns = [
        r"(?:contact|message|dm)\s*(?:hr|recruiter)?\s*(?:on\s*telegram|on\s*whatsapp)",
        r"wa\.me/\d+",
        r"t\.me/[a-zA-Z0-9_]+"
    ]
    # Exempt SIH logistics group coordination if .edu.in / aicte is mentioned
    if "sih" in text.lower() or "logistics" in text.lower() or "aicte" in text.lower() or ".edu.in" in text.lower():
        return False
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

def check_unrealistic_salary(text: str) -> bool:
    """Detects absurd daily returns for trivial tasks (e.g. YouTube likes)."""
    patterns = [
        r"youtube\s*(?:video\s*)?like\s*(?:and|&)?\s*subscribe",
        r"google\s*maps?\s*(?:5-star\s*)?(?:review|rating)",
        r"per\s*like\s*(?:₹|rs)",
        r"per\s*review\s*(?:₹|rs)",
        r"earn\s*(?:₹|rs\.?)\s*3,?000\s*(?:to|-)\s*(?:₹|rs\.?)\s*8,?000\s*daily",
        r"captcha\s*(?:entry|typing)",
        r"यूट्यूब.*लाइक|लाइक.*सब्सक्राइब|प्रत्येक\s*लाइक|यूट्यूब"
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

def check_freemail_for_company(text: str, domain: str = "") -> bool:
    """Detects freemail (@gmail.com, @yahoo.com) claiming to be an official MNC recruiter."""
    mncs = ["google", "wipro", "tcs", "infosys", "amazon", "microsoft"]
    mentions_mnc = any(m in text.lower() for m in mncs)
    has_freemail = bool(re.search(r"[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.com", text, re.IGNORECASE))
    return mentions_mnc and has_freemail

def check_personal_upi_in_job(text: str) -> bool:
    """Detects personal UPI VPAs (GPay/PhonePe/@ybl/@okaxis) in job offer contexts."""
    has_upi = bool(re.search(r"[a-zA-Z0-9.\-_]{2,64}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|apl|axl|ibl)", text, re.IGNORECASE))
    has_gpay = bool(re.search(r"\b(?:gpay|phonepe|paytm)\b", text, re.IGNORECASE))
    has_job_context = bool(re.search(r"\b(?:selected|wipro|google|tcs|infosys|hiring|job|onboarding|offer|internship)\b", text, re.IGNORECASE))
    return (has_upi or has_gpay) and has_job_context

def check_fake_govt_scheme(text: str) -> bool:
    """Detects fake laptop or scholarship grants with registration charges."""
    patterns = [
        r"(?:pm|prime\s*minister|pradhana\s*manthiri)\s*(?:free|ilavasa|yojana|laptop|scholarship)",
        r"dbt\s*student\s*grant",
        r"server\s*registration\s*fee",
        r"courier\s*kattanam|server\s*charge",
        r"മാർക്ക്\s*നിബന്ധനകളില്ല",
        r"இலவச\s*மடிக்கணினி"
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

def check_instant_loan_fee(text: str) -> bool:
    """Detects advance loan processing fees with zero credit check."""
    patterns = [
        r"instant\s*(?:₹|rs\.?)?\s*[\d,]+\s*loan",
        r"zero\s*cibil",
        r"noc\s*(?:and|&)?\s*loan\s*approval\s*file\s*processing\s*fee",
        r"disbursal\s*insurance\s*charge",
        r"సిবিল\s*స్కోర్\s*అవసరం\s*లేదు"
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

def evaluate_all_rules(text: str, domain: str = "") -> List[Dict[str, Any]]:
    """Runs all named red-flag rule functions."""
    triggered = []
    if check_fee_for_job(text):
        triggered.append({"rule": "check_fee_for_job", "name": "Upfront Fee for Employment / Internship", "weight": 45})
    if check_guaranteed_returns(text):
        triggered.append({"rule": "check_guaranteed_returns", "name": "Unrealistic Guaranteed Returns / Doubler", "weight": 75})
    if check_artificial_urgency(text):
        triggered.append({"rule": "check_artificial_urgency", "name": "Artificial Urgency & Coercion", "weight": 20})
    if check_chat_redirection(text):
        triggered.append({"rule": "check_chat_redirection", "name": "Unmonitored Chat Redirection", "weight": 20})
    if check_unrealistic_salary(text):
        triggered.append({"rule": "check_unrealistic_salary", "name": "Task / Rating / Subscribe Fraud", "weight": 35})
    if check_freemail_for_company(text, domain):
        triggered.append({"rule": "check_freemail_for_company", "name": "Freemail Impersonating Corporate Recruiter", "weight": 30})
    if check_personal_upi_in_job(text):
        triggered.append({"rule": "check_personal_upi_in_job", "name": "Personal UPI Solicitation in Job Context", "weight": 35})
    if check_fake_govt_scheme(text):
        triggered.append({"rule": "check_fake_govt_scheme", "name": "Fraudulent Government Scheme / Freebie", "weight": 40})
    if check_instant_loan_fee(text):
        triggered.append({"rule": "check_instant_loan_fee", "name": "Instant Loan Advance Processing Fee", "weight": 35})
    return triggered
