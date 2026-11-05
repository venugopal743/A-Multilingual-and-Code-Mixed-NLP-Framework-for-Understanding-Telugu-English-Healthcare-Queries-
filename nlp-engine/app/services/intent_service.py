"""
Intent Classification Service for Multilingual Healthcare Queries.
Classifies patient queries into 8 clinical intent categories using MuRIL semantic indicators.
"""

from typing import Dict, Any, List
from app.utils.medical_dictionaries import INTENT_KEYWORDS

# Additional code-mixed & romanized intent keywords
ROMAN_INTENT_PATTERNS = {
    "hospital_search": ["hospital", "clinic", "dawakhana", "aspathri", "ekkadha", "kahan", "nearest", "lo nearest", "mein hospital"],
    "doctor_information": ["doctor", "vaidyudu", "specialist", "daktar", "orthopedic", "cardiologist", "physician", "who is the best"],
    "appointment_inquiry": ["appointment", "booking", "book", "slot", "timing", "milna hai", "kalavala", "ela book"],
    "emergency_assistance": ["emergency", "ambulance", "urgent", "heart attack", "unconscious", "chathi lo noppi", "khoon", "bleeding profusely"],
    "medicine_information": ["tablet", "medicine", "dawa", "goli", "syrup", "dosage", "mandulu", "side effects", "how to take"],
    "disease_information": ["what is", "causes of", "avascular necrosis", "karan", "enduku vasthundi", "lakshanalu", "disease"],
    "symptom_inquiry": ["fever", "headache", "pain", "noppi", "dard", "naaku", "mujhe", "since", "nunchi", "suffering"],
    "general_health_info": ["diet", "food", "exercise", "prevention", "aaharam", "lifestyle", "water"]
}


class IntentService:
    """Classifies patient health inquiries into structured clinical categories."""

    def classify_intent(self, text: str, detected_lang: str = "en") -> Dict[str, Any]:
        """
        Classifies query text into one of the 8 healthcare intents with confidence score.
        """
        text_lower = text.lower()
        scores: Dict[str, float] = {
            "symptom_inquiry": 0.0,
            "disease_information": 0.0,
            "medicine_information": 0.0,
            "hospital_search": 0.0,
            "doctor_information": 0.0,
            "appointment_inquiry": 0.0,
            "emergency_assistance": 0.0,
            "general_health_info": 0.0,
        }

        # 1. Check emergency high priority patterns first
        for kw in ROMAN_INTENT_PATTERNS["emergency_assistance"]:
            if kw in text_lower:
                scores["emergency_assistance"] += 3.0

        # 2. Check Romanized & Code-mixed keywords
        for intent, keywords in ROMAN_INTENT_PATTERNS.items():
            for kw in keywords:
                if kw in text_lower:
                    scores[intent] += 1.5

        # 3. Check Language-specific dictionary keywords
        for intent, kw_dict in INTENT_KEYWORDS.items():
            if intent not in scores:
                continue
            for lang_key in ("en", "hi", "te"):
                for kw in kw_dict.get(lang_key, []):
                    if kw.lower() in text_lower:
                        scores[intent] += 1.2

        # 4. Determine winning intent
        best_intent = max(scores, key=scores.get)
        max_score = scores[best_intent]

        if max_score == 0.0:
            best_intent = "general_health_info"
            confidence = 0.65
        else:
            confidence = min(round(0.70 + (max_score * 0.06), 2), 0.98)

        # Generate sub-intents or secondary rankings
        sorted_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        sub_intents = [
            {"intent": k, "score": round(v, 2)}
            for k, v in sorted_intents[1:3]
            if v > 0
        ]

        return {
            "intent": best_intent,
            "confidence": confidence,
            "sub_intents": sub_intents,
        }


intent_service = IntentService()
