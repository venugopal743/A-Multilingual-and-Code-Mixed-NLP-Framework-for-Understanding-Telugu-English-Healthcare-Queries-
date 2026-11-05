import time
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.services.language_service import language_service
from app.services.ner_service import ner_service
from app.services.intent_service import intent_service
from app.services.rag_service import rag_service
from app.services.response_service import response_service

router = APIRouter(prefix="/api", tags=["Full NLP Chat Pipeline"])


class ChatRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Patient query text")
    language_preference: Optional[str] = Field("auto", description="en, hi, te, or auto")


@router.post("/chat")
async def chat_pipeline_endpoint(payload: ChatRequest):
    """
    Complete End-to-End NLP Pipeline:
    1. Language Detection & Code-Mixing Analysis (FastText + Indic script)
    2. Indic NLP Normalization
    3. Medical NER & Symptom Extraction (XLM-RoBERTa / MuRIL)
    4. Intent Classification (MuRIL 8-category model)
    5. FAISS Vector Knowledge Base Retrieval (multilingual-e5-base)
    6. Grounded Multilingual Response Generation (Qwen2.5 / Clinical templates)
    7. Explainability Breakdown
    """
    start_time = time.time()

    # Step 1 & 2: Language Detection & Normalization
    lang_info = language_service.detect_language(payload.text)
    detected_lang = lang_info["detected_language"]

    # Target language determination
    target_lang = payload.language_preference
    if not target_lang or target_lang == "auto":
        target_lang = detected_lang

    # Step 3: Medical NER
    ner_result = ner_service.extract_entities(payload.text, detected_lang)

    # Step 4: Intent Classification
    intent_result = intent_service.classify_intent(payload.text, detected_lang)

    # Step 5: Semantic Retrieval (RAG)
    rag_result = rag_service.retrieve(payload.text, top_k=3)

    # Step 6 & 7: Response & Explainability
    generation = response_service.generate_response(
        query=payload.text,
        lang_detection=lang_info,
        ner_result=ner_result,
        intent_result=intent_result,
        rag_result=rag_result,
        target_lang=target_lang,
    )

    elapsed_ms = int((time.time() - start_time) * 1000)

    return {
        "query": payload.text,
        "ai_response": generation["response"],
        "response_language": generation["response_language"],
        "detected_language": detected_lang,
        "processing_time": elapsed_ms,
        "analysis": {
            "language_detection": lang_info,
            "ner": ner_result,
            "intent": intent_result,
            "rag": rag_result,
            "processing_time": elapsed_ms,
            "explanation": generation["explanation"],
        },
    }
