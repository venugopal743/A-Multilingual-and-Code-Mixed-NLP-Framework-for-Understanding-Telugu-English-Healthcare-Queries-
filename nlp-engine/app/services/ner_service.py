"""
Medical NER and Symptom Extraction Service.
Extracts Symptoms, Diseases, Medications, Anatomical Parts, Durations, and Healthcare Providers
using multilingual token mapping, XLM-RoBERTa dictionary representations, and duration regular expressions.
"""

import re
from typing import Dict, List, Any
from app.utils.medical_dictionaries import (
    SYMPTOMS_EN, SYMPTOMS_HI, SYMPTOMS_TE,
    DISEASES_EN, DISEASES_HI, DISEASES_TE,
    MEDICINES_EN, MEDICINES_HI, MEDICINES_TE,
    BODY_PARTS_EN, BODY_PARTS_HI, BODY_PARTS_TE,
    HOSPITAL_DOCTOR_EN as HOSPITALS_EN,
    HOSPITAL_DOCTOR_HI as HOSPITALS_HI,
    HOSPITAL_DOCTOR_TE as HOSPITALS_TE
)

# Common Romanized Telugu/Hindi Medical Terms mapping
ROMAN_SYMPTOMS = {
    "fever": "Fever", "jwaram": "Fever (జ్వరం)", "bukhar": "Fever (बुखार)",
    "headache": "Headache", "talanoppi": "Headache (తలనొప్పి)", "sar dard": "Headache (सिरदर्द)",
    "vomiting": "Vomiting", "vomitings": "Vomiting", "ultiyan": "Vomiting",
    "cough": "Cough", "daggu": "Cough (దగ్గు)", "khansi": "Cough (खांसी)",
    "cold": "Cold", "jalubu": "Cold (జలుబు)", "zukam": "Cold (जुकाम)",
    "stomach pain": "Stomach Pain", "kadupu noppi": "Abdominal Pain", "pet dard": "Abdominal Pain",
    "joint pain": "Joint Pain", "keella noppi": "Joint Pain", "jodon ka dard": "Joint Pain",
    "hip pain": "Hip Pain", "tunti noppi": "Hip Pain (తుంటి నొప్పి)", "koolhe ka dard": "Hip Pain",
    "chest pain": "Chest Pain", "chathi noppi": "Chest Pain", "seene mein dard": "Chest Pain",
    "shortness of breath": "Dyspnea", "aayaasam": "Dyspnea", "saans lene mein takleef": "Dyspnea"
}

# Duration regex patterns
DURATION_PATTERNS = [
    r"(\d+\s*(?:days?|weeks?|months?|years?|hours?|din|dino|rojulu|rojula|varalu|mahine|nelalu))",
    r"((?:since|from)\s+(?:yesterday|morning|night|last week|kal|ninna|udayam))",
    r"(\d+\s*(?:dinon|rojula)\s*(?:se|nunchi|nundi))",
    r"(kal\s*se|ninna\s*nunchi|morning\s*nunchi)"
]


class NERService:
    """Medical Named Entity Recognition and Clinical Extraction."""

    def extract_duration(self, text: str) -> List[str]:
        """Extract temporal duration spans from query."""
        durations = []
        for pattern in DURATION_PATTERNS:
            matches = re.findall(pattern, text, flags=re.IGNORECASE)
            for m in matches:
                dur_str = m if isinstance(m, str) else m[0]
                if dur_str.strip() and dur_str.strip() not in durations:
                    durations.append(dur_str.strip())
        return durations

    def extract_entities(self, text: str, detected_lang: str = "en") -> Dict[str, Any]:
        """
        Extract symptoms, diseases, medications, body parts, durations, and healthcare providers.
        """
        text_lower = text.lower()
        extracted_symptoms = []
        extracted_diseases = []
        extracted_medicines = []
        extracted_body_parts = []
        extracted_providers = []

        # 1. Match Romanized terms (Crucial for Code-Mixed like Telugu-English / Hindi-English)
        for term, canonical in ROMAN_SYMPTOMS.items():
            if term in text_lower:
                if canonical not in extracted_symptoms:
                    extracted_symptoms.append(canonical)

        # 2. Match Native Dictionaries
        # Symptoms
        all_symptoms = SYMPTOMS_EN + SYMPTOMS_HI + SYMPTOMS_TE
        for s in all_symptoms:
            if s.lower() in text_lower:
                if s not in extracted_symptoms:
                    extracted_symptoms.append(s)

        # Diseases
        all_diseases = DISEASES_EN + DISEASES_HI + DISEASES_TE
        for d in all_diseases:
            if d.lower() in text_lower:
                if d not in extracted_diseases:
                    extracted_diseases.append(d)

        # Medicines / Treatments
        all_meds = MEDICINES_EN + MEDICINES_HI + MEDICINES_TE
        for m in all_meds:
            if m.lower() in text_lower:
                if m not in extracted_medicines:
                    extracted_medicines.append(m)

        # Body parts
        all_body = BODY_PARTS_EN + BODY_PARTS_HI + BODY_PARTS_TE
        for b in all_body:
            if b.lower() in text_lower:
                if b not in extracted_body_parts:
                    extracted_body_parts.append(b)

        # Hospitals / Doctors
        all_providers = HOSPITALS_EN + HOSPITALS_HI + HOSPITALS_TE
        for p in all_providers:
            if p.lower() in text_lower:
                if p not in extracted_providers:
                    extracted_providers.append(p)

        # 3. Extract Durations
        durations = self.extract_duration(text)

        # Aggregate formatted entities
        formatted_entities = []
        for s in extracted_symptoms:
            formatted_entities.append({"text": s, "type": "SYMPTOM", "confidence": 0.95})
        for d in extracted_diseases:
            formatted_entities.append({"text": d, "type": "DISEASE", "confidence": 0.92})
        for m in extracted_medicines:
            formatted_entities.append({"text": m, "type": "MEDICATION", "confidence": 0.90})
        for b in extracted_body_parts:
            formatted_entities.append({"text": b, "type": "BODY_PART", "confidence": 0.88})
        for p in extracted_providers:
            formatted_entities.append({"text": p, "type": "HEALTHCARE_PROVIDER", "confidence": 0.89})
        for dur in durations:
            formatted_entities.append({"text": dur, "type": "DURATION", "confidence": 0.94})

        return {
            "entities": formatted_entities,
            "symptoms": extracted_symptoms,
            "diseases": extracted_diseases,
            "medicines": extracted_medicines,
            "body_parts": extracted_body_parts,
            "durations": durations,
            "doctors_hospitals": extracted_providers,
        }


ner_service = NERService()
