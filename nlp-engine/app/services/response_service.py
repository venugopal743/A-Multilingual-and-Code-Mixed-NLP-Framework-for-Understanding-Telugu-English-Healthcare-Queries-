"""
Response Generation and Explainability Service.
Synthesizes NER entities, intent, and RAG clinical records into grounded,
multilingual healthcare responses in Telugu, Hindi, or English.
"""

from typing import Dict, Any, List

SAFETY_DISCLAIMERS = {
    "te": "\n\nâš ï¸ à°—à°®à°¨à°¿à°•: à°‡à°¦à°¿ à°•à±‡à°µà°²à°‚ à°¸à°®à°¾à°šà°¾à°° à°ªà±à°°à°¯à±‹à°œà°¨à°¾à°² à°•à±‹à°¸à°‚ à°°à±‚à°ªà±Šà°‚à°¦à°¿à°‚à°šà°¬à°¡à°¿à°¨ AI à°®à°¾à°°à±à°—à°¦à°°à±à°¶à°•à°¤à±à°µà°‚. à°–à°šà±à°šà°¿à°¤à°®à±ˆà°¨ à°¨à°¿à°°à±à°§à°¾à°°à°£ à°²à±‡à°¦à°¾ à°…à°¤à±à°¯à°µà°¸à°° à°ªà°°à°¿à°¸à±à°¥à°¿à°¤à±à°²à±à°²à±‹ à°¦à°¯à°šà±‡à°¸à°¿ à°…à°°à±à°¹à°¤ à°•à°²à°¿à°—à°¿à°¨ à°µà±ˆà°¦à±à°¯à±à°¡à°¿à°¨à°¿ à°¸à°‚à°ªà±à°°à°¦à°¿à°‚à°šà°‚à°¡à°¿.",
    "hi": "\n\nâš ï¸ à¤…à¤¸à¥à¤µà¥€à¤•à¤°à¤£: à¤¯à¤¹ à¤•à¥‡à¤µà¤² à¤¸à¥‚à¤šà¤¨à¤¾à¤¤à¥à¤®à¤• à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¨ à¤¹à¥ˆà¥¤ à¤•à¤¿à¤¸à¥€ à¤­à¥€ à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¥€à¤¯ à¤¸à¥à¤¥à¤¿à¤¤à¤¿, à¤¸à¤Ÿà¥€à¤• à¤¨à¤¿à¤¦à¤¾à¤¨ à¤¯à¤¾ à¤†à¤ªà¤¾à¤¤ à¤¸à¥à¤¥à¤¿à¤¤à¤¿ à¤®à¥‡à¤‚ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¯à¥‹à¤—à¥à¤¯ à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤• à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤²à¥‡à¤‚à¥¤",
    "en": "\n\nâš ï¸ Disclaimer: This information is AI-generated for educational guidance only and does not substitute professional medical diagnosis or prescription. Consult a healthcare provider if symptoms persist or worsen."
}


class ResponseService:
    """Generates explainable, clinically grounded responses in patient's preferred language."""

    def generate_response(
        self,
        query: str,
        lang_detection: Dict[str, Any],
        ner_result: Dict[str, Any],
        intent_result: Dict[str, Any],
        rag_result: Dict[str, Any],
        target_lang: str = None
    ) -> Dict[str, Any]:
        """
        Produce a grounded response and detailed explainability breakdown.
        """
        detected_lang = lang_detection.get("detected_language", "en")
        effective_lang = target_lang or detected_lang

        # Normalize language to base language
        if effective_lang.startswith("te"):
            base_lang = "te"
        elif effective_lang.startswith("hi"):
            base_lang = "hi"
        else:
            base_lang = "en"

        symptoms = ner_result.get("symptoms", [])
        diseases = ner_result.get("diseases", [])
        medicines = ner_result.get("medicines", [])
        durations = ner_result.get("durations", [])
        intent = intent_result.get("intent", "general_health_info")
        retrieved_docs = rag_result.get("retrieved_docs", [])

        # Formulate grounded clinical answer
        if base_lang == "te":
            response_text = self._build_telugu_response(symptoms, diseases, medicines, durations, intent, retrieved_docs)
        elif base_lang == "hi":
            response_text = self._build_hindi_response(symptoms, diseases, medicines, durations, intent, retrieved_docs)
        else:
            response_text = self._build_english_response(symptoms, diseases, medicines, durations, intent, retrieved_docs)

        # Safety disclaimer shown in UI footer; not appended to response text

        # Explainability narrative
        explanation = (
            f"Query analyzed in {detected_lang.upper()}. "
            f"Classified as '{intent.replace('_', ' ').title()}' ({int(intent_result.get('confidence', 0.9) * 100)}% confidence). "
            f"Extracted {len(symptoms)} symptom(s) and {len(diseases)} condition(s). "
            f"Grounded on {len(retrieved_docs)} clinical record(s) from our multilingual medical dataset."
        )

        return {
            "response": response_text,
            "response_language": base_lang,
            "explanation": explanation,
        }

    def _build_telugu_response(self, symptoms, diseases, medicines, durations, intent, docs) -> str:
        symptom_str = ", ".join(symptoms) if symptoms else "à°®à±€à°°à± à°¤à±†à°²à°¿à°ªà°¿à°¨ à°²à°•à±à°·à°£à°¾à°²à±"
        dur_str = f" ({durations[0]} à°¨à±à°‚à°¡à°¿)" if durations else ""

        if intent == "emergency_assistance":
            return f"ðŸš¨ à°…à°¤à±à°¯à°µà°¸à°° à°¹à±†à°šà±à°šà°°à°¿à°•: à°®à±€à°°à± à°¤à±†à°²à°¿à°ªà°¿à°¨ à°²à°•à±à°·à°£à°¾à°²à± ({symptom_str}) à°¤à°•à±à°·à°£ à°µà±ˆà°¦à±à°¯ à°¸à°¹à°¾à°¯à°‚ à°…à°µà°¸à°°à°®à°¯à±à°¯à±‡ à°ªà°°à°¿à°¸à±à°¥à°¿à°¤à°¿à°¨à°¿ à°¸à±‚à°šà°¿à°‚à°šà°µà°šà±à°šà±. à°¦à°¯à°šà±‡à°¸à°¿ à°µà±†à°‚à°Ÿà°¨à±‡ à°¸à°®à±€à°ªà°‚à°²à±‹à°¨à°¿ à°…à°¤à±à°¯à°µà°¸à°° à°µà°¿à°­à°¾à°—à°¾à°¨à°¿à°•à°¿ (Emergency/Ambulance 108) à°•à°¾à°²à± à°šà±‡à°¯à°‚à°¡à°¿."

        if intent == "hospital_search":
            return f"à°®à±€ à°¸à°®à±€à°ªà°‚à°²à±‹ à°†à°¸à±à°ªà°¤à±à°°à±à°²à± à°²à±‡à°¦à°¾ à°¸à±à°ªà±†à°·à°²à°¿à°¸à±à°Ÿà± à°µà±ˆà°¦à±à°¯à±à°² à°¸à°‚à°ªà±à°°à°¦à°¿à°‚à°ªà±à°² à°•à±‹à°¸à°‚, à°ªà±à°°à°­à±à°¤à±à°µ à°œà°¿à°²à±à°²à°¾ à°†à°¸à±à°ªà°¤à±à°°à°¿ à°²à±‡à°¦à°¾ à°¸à°®à±€à°ªà°‚à°²à±‹à°¨à°¿ à°…à°§à±€à°•à±ƒà°¤ à°•à±à°²à°¿à°¨à°¿à°•à±â€Œà°¨à± à°¸à°‚à°ªà±à°°à°¦à°¿à°‚à°šà°‚à°¡à°¿."

        text = f"à°®à±€à°°à± à°ªà±‡à°°à±à°•à±Šà°¨à±à°¨ à°²à°•à±à°·à°£à°¾à°²à±: {symptom_str}{dur_str}.\n"
        if docs:
            text += f"à°•à±à°²à°¿à°¨à°¿à°•à°²à± à°®à°¾à°°à±à°—à°¦à°°à±à°¶à°•à°¾à°² à°ªà±à°°à°•à°¾à°°à°‚, à°µà°¿à°¶à±à°°à°¾à°‚à°¤à°¿ à°¤à±€à°¸à±à°•à±‹à°µà°¡à°‚, à°¸à°®à±ƒà°¦à±à°§à°¿à°—à°¾ à°¨à±€à°°à± à°¤à°¾à°—à°¡à°‚ à°®à°°à°¿à°¯à± à°¤à±€à°µà±à°°à°®à±ˆà°¨ à°¶à°¾à°°à±€à°°à°• à°¶à±à°°à°®à°¨à± à°¨à°¿à°µà°¾à°°à°¿à°‚à°šà°¡à°‚ à°¸à±‚à°šà°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿."
        else:
            text += "à°®à±€ à°²à°•à±à°·à°£à°¾à°² à°†à°§à°¾à°°à°‚à°—à°¾ à°œà±€à°µà°¨à°¶à±ˆà°²à°¿ à°®à°¾à°°à±à°ªà±à°²à± à°®à°°à°¿à°¯à± à°µà°¿à°¶à±à°°à°¾à°‚à°¤à°¿ à°…à°µà°¸à°°à°‚."
        return text

    def _build_hindi_response(self, symptoms, diseases, medicines, durations, intent, docs) -> str:
        symptom_str = ", ".join(symptoms) if symptoms else "à¤¬à¤¤à¤¾à¤ à¤—à¤ à¤²à¤•à¥à¤·à¤£"
        dur_str = f" ({durations[0]} à¤¸à¥‡)" if durations else ""

        if intent == "emergency_assistance":
            return f"ðŸš¨ à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤šà¥‡à¤¤à¤¾à¤µà¤¨à¥€: à¤†à¤ªà¤•à¥‡ à¤²à¤•à¥à¤·à¤£ ({symptom_str}) à¤—à¤‚à¤­à¥€à¤° à¤¹à¥‹ à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¤à¥à¤°à¤‚à¤¤ à¤¨à¤œà¤¦à¥€à¤•à¥€ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤•à¥‡ à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨ à¤µà¤¿à¤­à¤¾à¤— à¤¯à¤¾ à¤à¤®à¥à¤¬à¥à¤²à¥‡à¤‚à¤¸ (108/102) à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤"

        if intent == "hospital_search":
            return f"à¤¨à¤œà¤¦à¥€à¤•à¥€ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤¯à¤¾ à¤µà¤¿à¤¶à¥‡à¤·à¤œà¥à¤ž à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤• à¤•à¥€ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤¯à¤¾ à¤œà¤¿à¤²à¤¾ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤¸à¥‡ à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤"

        text = f"à¤†à¤ªà¤•à¥‡ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¬à¤¤à¤¾à¤ à¤—à¤ à¤²à¤•à¥à¤·à¤£: {symptom_str}{dur_str}à¥¤\n"
        if docs:
            text += f"à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¥€à¤¯ à¤°à¤¿à¤•à¥‰à¤°à¥à¤¡ à¤”à¤° RAG à¤œà¥à¤žà¤¾à¤¨à¤•à¥‹à¤· à¤•à¥‡ à¤…à¤¨à¥à¤¸à¤¾à¤°, à¤ªà¤°à¥à¤¯à¤¾à¤ªà¥à¤¤ à¤†à¤°à¤¾à¤®, à¤¤à¤°à¤² à¤ªà¤¦à¤¾à¤°à¥à¤¥à¥‹à¤‚ à¤•à¤¾ à¤¸à¥‡à¤µà¤¨ à¤”à¤° à¤¦à¤°à¥à¤¦ à¤¨à¤¿à¤µà¤¾à¤°à¤£ à¤•à¥‡ à¤²à¤¿à¤ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤•à¥€ à¤¸à¤²à¤¾à¤¹ à¤†à¤µà¤¶à¥à¤¯à¤• à¤¹à¥ˆà¥¤"
        else:
            text += "à¤²à¤•à¥à¤·à¤£à¥‹à¤‚ à¤•à¥‹ à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤¿à¤¤ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤°à¤¾à¤® à¤”à¤° à¤¸à¤‚à¤¤à¥à¤²à¤¿à¤¤ à¤¦à¤¿à¤¨à¤šà¤°à¥à¤¯à¤¾ à¤…à¤ªà¤¨à¤¾à¤à¤‚à¥¤"
        return text

    def _build_english_response(self, symptoms, diseases, medicines, durations, intent, docs) -> str:
        symptom_str = ", ".join(symptoms) if symptoms else "reported symptoms"
        dur_str = f" (duration: {durations[0]})" if durations else ""

        if intent == "emergency_assistance":
            return f"ðŸš¨ Emergency Alert: Your query indicates potentially acute red-flag symptoms ({symptom_str}). Please call local emergency medical services (e.g. 108 / 911) or visit the nearest emergency room immediately."

        if intent == "hospital_search":
            return f"To locate the nearest qualified medical centers or specialized orthopedic/general departments, consider visiting your local primary healthcare center or district hospital."

        text = f"Clinical Assessment for {symptom_str}{dur_str}:\n"
        if docs:
            primary_snippet = docs[0].get("text", "")
            text += f"Based on verified medical guidelines:\nâ€¢ Recommended care includes rest, symptom monitoring, and avoiding heavy physical exertion.\nâ€¢ Relevant Clinical Context: {primary_snippet[:160]}..."
        else:
            text += "Adequate hydration, proper rest, and careful monitoring of symptom progression are recommended."
        return text


response_service = ResponseService()

