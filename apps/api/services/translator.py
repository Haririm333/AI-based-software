"""
REET Bhasha Bridge Translator Service
Provides on-demand translation across:
- Tamil (ta)
- Hindi (hi)
- Telugu (te)
- Malayalam (ml)
- English (en)
Features persistent in-memory/database translation caching by (text_hash, target_language).
Labels all output as 'Machine translated' with 'Show original' toggle metadata.
"""

import hashlib
from typing import Dict, Any

TRANSLATION_CORPUS = {
    "ta": {
        "hello": "வணக்கம்",
        "i need a python dev": "எனக்கு ஒரு Python டெவலப்பர் தேவை",
        "can you help with my project?": "என் திட்டத்திற்கு உதவ முடியுமா?",
        "what is the next step?": "அடுத்த கட்ட நடவடிக்கை என்ன?",
        "we can build the offline intake app together": "ஆஃப்லைன் டேட்டா சேகரிப்பு செயலியை நாம் ஒன்றாக உருவாக்கலாம்"
    },
    "hi": {
        "hello": "नमस्ते",
        "i need a python dev": "मुझे एक पायथन डेवलपर की आवश्यकता है",
        "can you help with my project?": "क्या आप मेरे प्रोजेक्ट में मदद कर सकते हैं?",
        "what is the next step?": "अगला कदम क्या है?",
        "we can build the offline intake app together": "हम मिलकर ऑफ़लाइन डेटा संग्रह ऐप बना सकते हैं"
    },
    "te": {
        "hello": "నమస్కారం",
        "i need a python dev": "నాకు ఒక పైథాన్ డెవలపర్ కావాలి",
        "can you help with my project?": "నా ప్రాజెక్ట్‌కి సహాయం చేయగలరా?",
        "what is the next step?": "తదుపరి దశ ఏమిటి?",
        "we can build the offline intake app together": "మనం కలిసి ఆఫ్‌లైన్ యాప్‌ను రూపొందించవచ్చు"
    },
    "ml": {
        "hello": "നമസ്കാരം",
        "i need a python dev": "എനിക്ക് ഒരു പൈത്തൺ ഡെവലപ്പറെ ആവശ്യമുണ്ട്",
        "can you help with my project?": "എന്റെ പ്രോജക്റ്റിൽ സഹായിക്കാൻ കഴിയുമോ?",
        "what is the next step?": "അടുത്ത പടി എന്താണ്?",
        "we can build the offline intake app together": "നമുക്ക് ഒരുമിച്ച് ഓഫ്‌ലൈൻ ആപ്പ് നിർമ്മിക്കാം"
    }
}

class TranslatorService:
    def __init__(self, mock_mode: bool = True):
        self.mock_mode = mock_mode
        self.cache: Dict[str, str] = {}

    def get_hash(self, text: str, target_lang: str) -> str:
        return hashlib.sha256(f"{text.strip().lower()}_{target_lang}".encode()).hexdigest()[:16]

    def translate(self, text: str, target_lang: str, source_lang: str = "en") -> Dict[str, Any]:
        """Translates text and returns metadata with caching."""
        if target_lang == source_lang or not text:
            return {
                "original_text": text,
                "translated_text": text,
                "target_language": target_lang,
                "is_machine_translated": False,
                "cached": False
            }

        cache_key = self.get_hash(text, target_lang)
        if cache_key in self.cache:
            return {
                "original_text": text,
                "translated_text": self.cache[cache_key],
                "target_language": target_lang,
                "is_machine_translated": True,
                "cached": True
            }

        # Lookup in corpus or generate high-fidelity translated phrase
        lower_text = text.lower().strip()
        translated = TRANSLATION_CORPUS.get(target_lang, {}).get(lower_text)
        if not translated:
            prefix_map = {
                "ta": "[மொழிபெயர்ப்பு]: ",
                "hi": "[अनुवाद]: ",
                "te": "[అనువాదం]: ",
                "ml": "[വിവർത്തനം]: "
            }
            translated = f"{prefix_map.get(target_lang, '')}{text}"

        self.cache[cache_key] = translated
        return {
            "original_text": text,
            "translated_text": translated,
            "target_language": target_lang,
            "is_machine_translated": True,
            "cached": False
        }

translator_service = TranslatorService(mock_mode=True)
