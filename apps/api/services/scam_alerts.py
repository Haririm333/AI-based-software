"""
REET Scam Alerts Service
Community threat feed and viral money rumor fact-checking registry.
Aggregated and anonymized (no personal student data).
"""

from typing import List, Dict, Any

VIRAL_RUMORS = [
    {
        "id": "rumor-01",
        "title": "PM Free Laptop Scheme 2026 WhatsApp Forward",
        "claim": "Government of India is distributing free HP and Lenovo laptops to all college students via WhatsApp link.",
        "status": "DEBUNKED / PHISHING",
        "debunk": "PIB Fact Check confirmed no such scheme exists. The link captures Aadhaar details and demands upfront registration fees.",
        "advisory_url": "https://pib.gov.in/FactCheck"
    },
    {
        "id": "rumor-02",
        "title": "RBI ₹5,000 Digital Rupee Student Diwali Airdrop",
        "claim": "RBI is gifting ₹5,000 e-Rupee tokens directly to Indian bank accounts via WhatsApp APK download.",
        "status": "MALICIOUS TROJAN FRAUD",
        "debunk": "RBI never conducts direct token giveaways or distributes APK files via WhatsApp. Contains an SMS stealer.",
        "advisory_url": "https://rbi.org.in"
    },
    {
        "id": "rumor-03",
        "title": "Telegram Part-time Amazon/Flipkart Review Job ₹3,000/Day",
        "claim": "Earn ₹3,000 to ₹8,000 daily from home simply by giving 5-star ratings to e-commerce products.",
        "status": "ADVANCE-FEE TASK SCAM",
        "debunk": "Classic task fraud. Scammers demand large prepaid merchant recharges after trivial initial payments.",
        "advisory_url": "https://cybercrime.gov.in"
    },
    {
        "id": "rumor-04",
        "title": "TCS Direct Off-Campus Joining Letter Without Interview",
        "claim": "Direct TCS onboarding upon payment of ₹1,500 document courier and verification charge.",
        "status": "JOB RECRUITMENT FRAUD",
        "debunk": "TCS official notice affirms: TCS never charges any fee at any stage of hiring, nor collects cash or UPI deposits.",
        "advisory_url": "https://tcs.com/careers"
    },
    {
        "id": "rumor-05",
        "title": "Mobile Captcha Typing ₹1,000/Hour Wallet Activation",
        "claim": "Type simple captchas on mobile and earn ₹1,000 per hour. Pay ₹300 activation wallet deposit.",
        "status": "FAKE WORK FROM HOME SCAM",
        "debunk": "Fraudulent portal designed to collect non-refundable ₹300 deposits from students with rigged withdrawal thresholds.",
        "advisory_url": "https://cybercrime.gov.in"
    },
    {
        "id": "rumor-06",
        "title": "Student Education Loan Complete Waiver OTP Scam",
        "claim": "New government gazette waives all student education loans up to ₹5 Lakhs if you confirm OTP on link.",
        "status": "IDENTITY THEFT & BANK FRAUD",
        "debunk": "No blanket student loan waiver has been announced. The portal captures net banking credentials and Aadhaar OTPs.",
        "advisory_url": "https://rbi.org.in"
    }
]

class ScamAlertsService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode
        self.rumors = VIRAL_RUMORS

    def get_all_rumors(self) -> List[Dict[str, Any]]:
        return self.rumors

scam_alerts_service = ScamAlertsService(mock_mode=True)
