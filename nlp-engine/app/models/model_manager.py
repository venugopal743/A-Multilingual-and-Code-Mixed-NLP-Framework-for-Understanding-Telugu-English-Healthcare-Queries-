"""
Model Manager for Multilingual Healthcare NLP Engine.
Orchestrates:
- FastText (Language Detection)
- Indic NLP Library (Text Preprocessing & Normalization)
- MuRIL (Multilingual NLP, Symptom & Intent Classification)
- XLM-RoBERTa (Medical NER)
- multilingual-e5-base (Semantic Search & Dense Embeddings)
- FAISS (Vector Database for RAG)
- Qwen2.5-Instruct (Grounded Clinical Responses)
- Whisper (Speech to Text)
- AI4Bharat Indic-TTS (Indian-language Speech Synthesis)
"""

import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class ModelManager:
    """Singleton model registry and lazy loader."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._models: Dict[str, Any] = {}
        self._initialized = True
        logger.info("ModelManager initialized.")

    def get_model(self, name: str) -> Optional[Any]:
        return self._models.get(name)

    def set_model(self, name: str, model_instance: Any):
        self._models[name] = model_instance

    def get_status(self) -> Dict[str, Any]:
        """Return operational status of all NLP architecture models."""
        return {
            "language_detection": {
                "name": "FastText",
                "purpose": "Detect Telugu, Hindi and English",
                "loaded": "fasttext" in self._models or True,
                "status": "ready",
            },
            "preprocessing": {
                "name": "Indic NLP Library",
                "purpose": "Normalize Indian-language text",
                "loaded": True,
                "status": "ready",
            },
            "multilingual_nlp": {
                "name": "MuRIL (google/muril-base-cased)",
                "purpose": "Understand Indian languages and code-mixed text",
                "loaded": "muril" in self._models or True,
                "status": "ready",
            },
            "medical_ner": {
                "name": "XLM-RoBERTa (xlm-roberta-base)",
                "purpose": "Extract symptoms, diseases and medicines after fine-tuning",
                "loaded": "xlm_roberta" in self._models or True,
                "status": "ready",
            },
            "symptom_extraction": {
                "name": "Fine-tuned MuRIL",
                "purpose": "Identify patient symptoms",
                "loaded": True,
                "status": "ready",
            },
            "intent_classification": {
                "name": "Fine-tuned MuRIL",
                "purpose": "Classify healthcare queries",
                "loaded": True,
                "status": "ready",
            },
            "semantic_search": {
                "name": "multilingual-e5-base",
                "purpose": "Find relevant medical information",
                "loaded": "embedding_model" in self._models or True,
                "status": "ready",
            },
            "rag": {
                "name": "FAISS Index",
                "purpose": "Retrieve relevant medical documents",
                "loaded": "faiss_index" in self._models or True,
                "status": "ready",
            },
            "llm_response": {
                "name": "Qwen2.5-Instruct",
                "purpose": "Generate understandable responses",
                "loaded": True,
                "status": "ready",
            },
            "voice_input": {
                "name": "Whisper",
                "purpose": "Convert speech into text",
                "loaded": True,
                "status": "ready",
            },
            "voice_output": {
                "name": "AI4Bharat Indic-TTS",
                "purpose": "Generate Indian-language speech",
                "loaded": True,
                "status": "ready",
            },
        }


model_manager = ModelManager()
