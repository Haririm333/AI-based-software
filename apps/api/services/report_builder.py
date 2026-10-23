"""
REET Report Builder Service
Packages suspect evidence into the official cybercrime.gov.in complaint format.
Features:
- Handles prefilled dossier generation (suspect handle, UPI ID, message log, timestamps)
- Dispatches National Cybercrime Helpline 1930 guidance
- Adheres strictly to Responsible AI: Does NOT claim to submit on user's behalf or freeze UPIs.
- Awards 'Safety' skill and Safety Sentinel badge with a unique verification hash upon confirmation.
"""

import uuid
from datetime import datetime
from typing import Dict, Any

class ReportBuilderService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    def build_complaint_dossier(
        self,
        reporter_handle: str,
        suspect_handle: str,
        suspect_upi: str,
        evidence_text: str,
        solicited_amount: str = "₹2,000"
    ) -> Dict[str, Any]:
        """Generates prefilled legal complaint dossier for user to copy & submit to cybercrime.gov.in."""
        dossier_id = f"CYBER-IN-2026-{uuid.uuid4().hex[:6].upper()}"
        now = datetime.now()
        date_str = now.strftime("%d %B %Y")
        time_str = now.strftime("%I:%M %p IST")

        formal_complaint = (
            f"================================================================================\n"
            f"NATIONAL CYBER CRIME REPORTING PORTAL (cybercrime.gov.in)\n"
            f"PRE-FILLED INCIDENT COMPLAINT DOSSIER\n"
            f"Dossier ID: {dossier_id}\n"
            f"================================================================================\n\n"
            f"1. INCIDENT CATEGORY:\n"
            f"   - Primary: Online Financial Fraud\n"
            f"   - Sub-Category: Job / Internship Advance Fee Scam (Section 66D IT Act & BNS)\n\n"
            f"2. INCIDENT TIMESTAMP & PLATFORM:\n"
            f"   - Date of Incident: {date_str}\n"
            f"   - Time of Incident: {time_str}\n"
            f"   - Originating Platform: REET Campus Social Media (Payment Guard Intercepted)\n\n"
            f"3. SUSPECT INFORMATION:\n"
            f"   - Suspect Platform Handle: {suspect_handle}\n"
            f"   - Fraudulent Beneficiary UPI ID: {suspect_upi}\n"
            f"   - Demanded Advance Amount: {solicited_amount}\n\n"
            f"4. BRIEF INCIDENT DESCRIPTION:\n"
            f"   The suspect approached a college student with a fraudulent internship offer and\n"
            f"   demanded an advance seat-booking fee to be transferred to personal UPI ID: {suspect_upi}.\n"
            f"   The transaction was intercepted by Trust Shield before money was transferred.\n\n"
            f"5. DIGITAL EVIDENCE LOG:\n"
            f"   - Chat Excerpt: \"{evidence_text.strip()}\"\n"
            f"   - Threat Level: 92/100 (High Risk - Blocked)\n\n"
            f"6. STATUTORY CITIZEN ADVISORY:\n"
            f"   - National Helpline: 1930 (Immediate 24x7 Citizen Financial Fraud Helpline)\n"
            f"   - Official Reporting Portal: https://cybercrime.gov.in\n"
            f"   - Notice: Please copy this dossier and paste it into the official portal.\n"
            f"================================================================================"
        )

        badge_hash = f"TS-{uuid.uuid4().hex[:8].upper()}-SENTINEL"

        return {
            "dossier_id": dossier_id,
            "formal_complaint_text": formal_complaint,
            "helpline_1930": {
                "number": "1930",
                "label": "National Cybercrime Citizen Financial Fraud Helpline",
                "action": "Immediate citizen reporting for freezing fraudulent accounts"
            },
            "official_portal_url": "https://cybercrime.gov.in",
            "proof_point_reward": {
                "skill_awarded": "Safety",
                "badge_name": "Trust Shield Safety Sentinel",
                "verification_hash": badge_hash,
                "trust_quotient_boost": 20
            }
        }

report_builder_service = ReportBuilderService(mock_mode=True)
