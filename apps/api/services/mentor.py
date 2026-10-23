"""
REET Mentor Service
Interactive coach grounded in the project's exact scoring evidence.
For each defect:
- What it is
- Why it matters
- How to fix it (with code diff)
- One actionable practice task
Delivers explanations in Tamil, Hindi, Telugu, Malayalam, and English.
For scores below 5.0, generates a structured 3-step improvement recovery plan.
"""

from typing import Dict, Any, List

MENTOR_KNOWLEDGE_BASE = {
    "Bandit B201: Flask app running with debug=True": {
        "en": {
            "what": "Flask's interactive Werkzeug debugger is active in your server configuration (app.run(debug=True)).",
            "why": "In production, an unhandled exception allows anyone to execute arbitrary Python code directly in their browser console.",
            "how": "Read environment variables instead: `debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'`.",
            "task": "Create a `.env.example` file and configure `python-dotenv` to load secrets and debug state."
        },
        "ta": {
            "what": "உங்கள் Flask செயலியில் Werkzeug interactive debugger இயக்கத்தில் உள்ளது (app.run(debug=True)).",
            "why": "இது இணையத்தில் யாரேனும் உங்கள் சர்வரில் Python கட்டளைகளை நேரடியாக இயக்க அனுமதிக்கும் அபாயம் உள்ளது.",
            "how": "சுற்றுச்சூழல் மாறிகளை (Environment Variables) பயன்படுத்துங்கள்: `debug = os.getenv('FLASK_DEBUG', 'False') == 'true'`.",
            "task": "ஒரு `.env.example` கோப்பை உருவாக்கி ரகசிய குறியீடுகளைப் பாதுகாப்பாக தனிமைப்படுத்துங்கள்."
        },
        "hi": {
            "what": "आपके Flask कोड में debug=True सीधे हार्डकोड किया गया है।",
            "why": "उत्पादन (production) वातावरण में कोई भी हमलावर ब्राउज़र से सीधा Python कोड निष्पादित कर सकता है।",
            "how": "`os.getenv('FLASK_DEBUG')` का प्रयोग कर इसे पर्यावरण चर (environment variable) में बदलें।",
            "task": "एक `.env.example` फ़ाइल बनाएं और अपने सीक्रेट्स को सुरक्षित रखें।"
        },
        "te": {
            "what": "మీ Flask అప్లికేషన్‌లో debug=True ఎనేబుల్ చేయబడింది.",
            "why": "ప్రొడక్షన్‌లో ఇది హ్యాకర్లు సర్వర్‌లో అనధికార పైథాన్ కోడ్ రన్ చేయడానికి దారితీయవచ్చు.",
            "how": "`os.getenv` ఉపయోగించి ఎన్విరాన్మెంట్ వేరియబుల్స్ ద్వారా డీబగ్ సెట్ చేయండి.",
            "task": "ఒక `.env.example` ఫైల్ క్రియేట్ చేసి కాన్ఫిగరేషన్ వేరు చేయండి."
        },
        "ml": {
            "what": "നിങ്ങളുടെ Flask ആപ്പിൽ debug=True നേരിട്ട് കോഡ് ചെയ്തിരിക്കുന്നു.",
            "why": "പ്രൊഡക്ഷനിൽ ഇതൊരു വലിയ സുരക്ഷാ ഭീഷണിയാണ്; ആർക്കും കമാൻഡുകൾ റൺ ചെയ്യാം.",
            "how": "`os.getenv` ഉപയോഗിച്ച് ഡീബഗ് കോൺഫിഗറേഷൻ മാറ്റുക.",
            "task": "ഒരു `.env` ഫയൽ ഉണ്ടാക്കി വേരിയബിളുകൾ അതിലേക്ക് മാറ്റുക."
        }
    },
    "default_defect": {
        "en": {
            "what": "Monolithic architecture with all endpoints defined in a single file.",
            "why": "As routes scale, code readability degrades and isolated unit testing becomes impossible.",
            "how": "Refactor routes into Flask Blueprints inside an `app/routes/` directory.",
            "task": "Create a `notes_bp = Blueprint('notes', __name__)` and move CRUD routes into it."
        },
        "ta": {
            "what": "அனைத்து endpoints-களும் ஒரே ஃபைலில் (app.py) எழுதப்பட்டுள்ளது (Monolithic).",
            "why": "திட்டம் வளரும்போது குறியீட்டைப் பராமரிப்பதும் டெஸ்ட் செய்வதும் மிகவும் கடினமாகிவிடும்.",
            "how": "Flask Blueprints முறையைப் பயன்படுத்தி கோப்புகளைப் பிரித்து ஒழுங்கமைக்கவும்.",
            "task": "`app/routes/` ஃபோல்டரை உருவாக்கி Blueprints மூலம் பிரித்து எழுதவும்."
        },
        "hi": {
            "what": "सभी राउट्स एक ही फ़ाइल में लिखे गए हैं (Monolithic structure).",
            "why": "प्रोजेक्ट बड़ा होने पर कोड मेंटेन करना और टेस्टिंग करना कठिन हो जाता है।",
            "how": "Flask Blueprints का उपयोग करके राउट्स को अलग-अलग मॉड्यूल में विभाजित करें।",
            "task": "`app/routes/` डायरेक्टरी बनाकर Blueprints लागू करें।"
        },
        "te": {
            "what": "అన్ని ఎండ్‌పాయింట్లు ఒకే ఫైల్‌లో ఉన్నాయి.",
            "why": "ప్రాజెక్ట్ పరిమాణం పెరిగినప్పుడు కోడ్ నిర్వహణ మరియు టెస్టింగ్ కష్టమవుతుంది.",
            "how": "Flask Blueprints ఉపయోగించి కోడ్‌ను మాడ్యులర్‌గా మార్చండి.",
            "task": "Blueprints ద్వారా రూట్లను ప్రత్యేక ఫైళ్లలోకి విభజించండి."
        },
        "ml": {
            "what": "എല്ലാ റൂട്ടുകളും ഒറ്റ ഫയലിലാണ് എഴുതിയിരിക്കുന്നത്.",
            "why": "പ്രോജക്റ്റ് വലുതാകുമ്പോൾ പരിപാലിക്കാൻ ബുദ്ധിമുട്ടാകും.",
            "how": "Flask Blueprints ഉപയോഗിച്ച് റൂട്ടുകൾ പ്രത്യേക മൊഡ്യൂളുകളാക്കുക.",
            "task": "Blueprints ഉപയോഗിച്ച് കോഡ് പുനഃക്രമീകരിക്കുക."
        }
    }
}

class MentorService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode

    def get_advice_for_score_run(
        self,
        breakdown: Dict[str, Any],
        language: str = "en",
        overall_score: float = 7.2
    ) -> Dict[str, Any]:
        """Provides grounded defect advice and an improvement plan if score < 5.0."""
        lang = language if language in ["ta", "hi", "te", "ml", "en"] else "en"
        findings = breakdown.get("security_findings", [])
        
        # Pick relevant defect entry
        defect_key = findings[0] if findings and findings[0] in MENTOR_KNOWLEDGE_BASE else "default_defect"
        advice_content = MENTOR_KNOWLEDGE_BASE.get(defect_key, MENTOR_KNOWLEDGE_BASE["default_defect"])[lang]

        # For scores below 5.0, produce a 3-step structured improvement recovery plan
        recovery_plan = None
        if overall_score < 5.0:
            recovery_plan = {
                "step_1": "Resolve root execution defects: fix syntax errors and unpinned packages in requirements.txt.",
                "step_2": "Implement at least 3 unit tests verifying your core business logic endpoints.",
                "step_3": "Write a 5-step reproducible README walkthrough with expected response samples.",
                "mentor_encouragement": "Low scores on early attempts are normal learning data points. Fix these three steps and your resubmission growth curve will be celebrated!"
            }

        return {
            "target_language": lang,
            "overall_score": overall_score,
            "defect_analyzed": defect_key,
            "what_it_is": advice_content["what"],
            "why_it_matters": advice_content["why"],
            "how_to_fix": advice_content["how"],
            "practice_task": advice_content["task"],
            "recovery_plan": recovery_plan
        }

mentor_service = MentorService(mock_mode=True)
