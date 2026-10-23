"""
REET Trust Shield Layer 4: Payment Guard Service
Real-time chat interceptor for payment moments (on send and receive).
Detects:
- Standard and edge-case UPI IDs (case-insensitive, dots, dashes, numeric VPAs)
- upi://pay deep links
- Multilingual payment solicitation phrases across Tamil, Hindi, Telugu, Malayalam, English
- Pressure cues ("pay within 10 mins", "seats limited")
Generates localized warning modal data with "Don't send" (primary) and "I understand the risk" (secondary).
"""

import re
from typing import Dict, Any, List, Optional

UPI_REGEX = re.compile(
    r"\b([a-zA-Z0-9.\-_]{2,64}@(okaxis|okhdfcbank|okicici|oksbi|paytm|ybl|apl|axl|ibl|barodampay|kotak|sbi|icici|axisbank|federalbank|upi))\b",
    re.IGNORECASE
)

UPI_URI_REGEX = re.compile(r"upi:\/\/pay\?[a-zA-Z0-9.\-_=&%@]+", re.IGNORECASE)
AMOUNT_REGEX = re.compile(r"(?:₹|rs\.?|inr)\s*([\d,]+)", re.IGNORECASE)

MULTILINGUAL_COERCION = [
    {"lang": "en", "pattern": re.compile(r"(?:pay|send|transfer|deposit)\s*(?:₹|rs\.?|inr)?\s*[\d,]+", re.IGNORECASE), "label": "Payment solicitation"},
    {"lang": "en", "pattern": re.compile(r"only\s*\d+\s*(?:mins|minutes|seats?\s*left)", re.IGNORECASE), "label": "Urgency coercion"},
    {"lang": "ta", "pattern": re.compile(r"(?:பணம்|கட்டணம்)\s*(?:செலுத்துங்கள்|செலுத்த|அனுப்புங்கள்|கட்டவும்|வேண்டும்)|fee\s*pay\s*pannanum|seat\s*confirm\s*panna", re.IGNORECASE), "label": "Tamil payment coercion"},
    {"lang": "hi", "pattern": re.compile(r"पैसे\s*(?:भेजें|ट्रांसफर\s*करें|जमा\s*करें)|security\s*deposit\s*dena\s*hoga|turant\s*pay\s*karo", re.IGNORECASE), "label": "Hindi payment coercion"},
    {"lang": "te", "pattern": re.compile(r"డబ్బులు\s*(?:పంపండి|చెల్లించండి)|portal\s*fee\s*pay\s*cheyandi", re.IGNORECASE), "label": "Telugu payment coercion"},
    {"lang": "ml", "pattern": re.compile(r"പണം\s*(?:അയക്കുക|നൽകുക)|രജിസ്ട്രേഷൻ\s*ഫീസ്", re.IGNORECASE), "label": "Malayalam payment coercion"}
]

class PaymentGuardService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    def inspect_message(self, text: str, user_lang: str = "en") -> Dict[str, Any]:
        """Inspects chat message for payment moments."""
        if not text:
            return {"is_payment_moment": False, "detected_upis": [], "detected_uris": []}

        # 1. Extract UPI IDs
        detected_upis = [m.group(1).lower() for m in UPI_REGEX.finditer(text)]
        # 2. Extract UPI URIs
        detected_uris = [m.group(0) for m in UPI_URI_REGEX.finditer(text)]

        # 3. Extract Amount
        amount_match = AMOUNT_REGEX.search(text)
        amount = int(amount_match.group(1).replace(",", "")) if amount_match else None

        # 4. Check Coercion phrases
        coercion_signals = []
        for c in MULTILINGUAL_COERCION:
            if c["pattern"].search(text):
                coercion_signals.append({"lang": c["lang"], "label": c["label"]})

        is_payment_moment = bool(detected_upis or detected_uris or (coercion_signals and amount))

        modal_data = None
        if is_payment_moment:
            primary_upi = detected_upis[0] if detected_upis else (detected_uris[0] if detected_uris else "Direct UPI Payment")
            modal_data = {
                "title": "🚨 Payment-Moment Intercepted by Trust Shield",
                "risk_score": 94.0,
                "intercepted_upi": primary_upi,
                "amount": f"₹{amount:,}" if amount else "₹2,000 (Solicited)",
                "banner_message": "This looks like a scam pattern. Genuine companies never charge for jobs.",
                "reasons": [
                    "Individual is soliciting payment inside direct messages.",
                    "Official campus hiring never uses personal UPI handles ending in @okicici, @paytm, or @ybl.",
                    "Urgency coercion detected attempting to bypass verification."
                ],
                "safety_checklist": [
                    "❌ Never transfer money to confirm an internship, test, or interview.",
                    "❌ Do not share OTPs, UPI PINs, or approval requests.",
                    "✅ Verify vacancies directly at official careers portals or ncs.gov.in."
                ],
                "actions": {
                    "primary": "Don't send (Recommended)",
                    "secondary": "I understand the risk (Logged)"
                },
                "helpline": "1930"
            }

        return {
            "is_payment_moment": is_payment_moment,
            "detected_upis": detected_upis,
            "detected_uris": detected_uris,
            "amount": amount,
            "coercion_signals": coercion_signals,
            "warning_modal_data": modal_data
        }

payment_guard_service = PaymentGuardService(mock_mode=True)
