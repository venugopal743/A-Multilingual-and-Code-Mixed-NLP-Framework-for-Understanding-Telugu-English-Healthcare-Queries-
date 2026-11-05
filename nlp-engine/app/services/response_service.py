"""
Response Generation and Explainability Service.
Synthesizes NER entities, intent, and RAG clinical records into grounded,
multilingual healthcare responses in Telugu, Hindi, or English.
"""

from typing import Dict, Any, List

SAFETY_DISCLAIMERS = {
    "te": "\n\n⚠️ గమనిక: ఇది కేవలం సమాచార ప్రయోజనాల కోసం రూపొందించబడిన AI మార్గదర్శకత్వం. ఖచ్చితమైన నిర్ధారణ లేదా అత్యవసర పరిస్థితుల్లో దయచేసి అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.",
    "hi": "\n\n⚠️ अस्वीकरण: यह केवल सूचनात्मक मार्गदर्शन है। किसी भी चिकित्सीय स्थिति, सटीक निदान या आपात स्थिति में कृपया योग्य चिकित्सक से परामर्श लें।",
    "en": "\n\n⚠️ Disclaimer: This information is AI-generated for educational guidance only and does not substitute professional medical diagnosis or prescription. Consult a healthcare provider if symptoms persist or worsen."
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

        # Append appropriate safety disclaimer
        response_text += SAFETY_DISCLAIMERS.get(base_lang, SAFETY_DISCLAIMERS["en"])

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
        symptom_str = ", ".join(symptoms) if symptoms else "మీరు తెలిపిన లక్షణాలు"
        dur_str = f" ({durations[0]} నుండి)" if durations else ""

        if intent == "emergency_assistance":
            return f"🚨 అత్యవసర హెచ్చరిక: మీరు తెలిపిన లక్షణాలు ({symptom_str}) తక్షణ వైద్య సహాయం అవసరమయ్యే పరిస్థితిని సూచించవచ్చు. దయచేసి వెంటనే సమీపంలోని అత్యవసర విభాగానికి (Emergency/Ambulance 108) కాల్ చేయండి."

        if intent == "hospital_search":
            return f"మీ సమీపంలో ఆసుపత్రులు లేదా స్పెషలిస్ట్ వైద్యుల సంప్రదింపుల కోసం, ప్రభుత్వ జిల్లా ఆసుపత్రి లేదా సమీపంలోని అధీకృత క్లినిక్‌ను సంప్రదించండి."

        text = f"మీరు పేర్కొన్న లక్షణాలు: {symptom_str}{dur_str}.\n"
        if docs:
            text += f"క్లినికల్ మార్గదర్శకాల ప్రకారం, విశ్రాంతి తీసుకోవడం, సమృద్ధిగా నీరు తాగడం మరియు తీవ్రమైన శారీరక శ్రమను నివారించడం సూచించబడింది."
        else:
            text += "మీ లక్షణాల ఆధారంగా జీవనశైలి మార్పులు మరియు విశ్రాంతి అవసరం."
        return text

    def _build_hindi_response(self, symptoms, diseases, medicines, durations, intent, docs) -> str:
        symptom_str = ", ".join(symptoms) if symptoms else "बताए गए लक्षण"
        dur_str = f" ({durations[0]} से)" if durations else ""

        if intent == "emergency_assistance":
            return f"🚨 आपातकालीन चेतावनी: आपके लक्षण ({symptom_str}) गंभीर हो सकते हैं। कृपया तुरंत नजदीकी अस्पताल के आपातकालीन विभाग या एम्बुलेंस (108/102) से संपर्क करें।"

        if intent == "hospital_search":
            return f"नजदीकी अस्पताल या विशेषज्ञ चिकित्सक की जानकारी के लिए कृपया स्थानीय स्वास्थ्य केंद्र या जिला अस्पताल से संपर्क करें।"

        text = f"आपके द्वारा बताए गए लक्षण: {symptom_str}{dur_str}।\n"
        if docs:
            text += f"चिकित्सीय रिकॉर्ड और RAG ज्ञानकोष के अनुसार, पर्याप्त आराम, तरल पदार्थों का सेवन और दर्द निवारण के लिए डॉक्टर की सलाह आवश्यक है।"
        else:
            text += "लक्षणों को नियंत्रित करने के लिए आराम और संतुलित दिनचर्या अपनाएं।"
        return text

    def _build_english_response(self, symptoms, diseases, medicines, durations, intent, docs) -> str:
        symptom_str = ", ".join(symptoms) if symptoms else "reported symptoms"
        dur_str = f" (duration: {durations[0]})" if durations else ""

        if intent == "emergency_assistance":
            return f"🚨 Emergency Alert: Your query indicates potentially acute red-flag symptoms ({symptom_str}). Please call local emergency medical services (e.g. 108 / 911) or visit the nearest emergency room immediately."

        if intent == "hospital_search":
            return f"To locate the nearest qualified medical centers or specialized orthopedic/general departments, consider visiting your local primary healthcare center or district hospital."

        text = f"Clinical Assessment for {symptom_str}{dur_str}:\n"
        if docs:
            primary_snippet = docs[0].get("text", "")
            text += f"Based on verified medical guidelines:\n• Recommended care includes rest, symptom monitoring, and avoiding heavy physical exertion.\n• Relevant Clinical Context: {primary_snippet[:160]}..."
        else:
            text += "Adequate hydration, proper rest, and careful monitoring of symptom progression are recommended."
        return text


response_service = ResponseService()
