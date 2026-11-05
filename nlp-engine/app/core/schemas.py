"""
Pydantic models for all request/response types in the multilingual healthcare NLP engine.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ── Request Models ───────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    """Incoming query from a user."""
    text: str = Field(..., min_length=1, max_length=5000, description="User query text")
    language_preference: Optional[str] = Field(
        None,
        description="Preferred response language: en, hi, te. If None, auto-detected.",
    )
    detect_language: bool = Field(
        True,
        description="Whether to auto-detect the language of the input text.",
    )


class VoiceRequest(BaseModel):
    """Request for voice synthesis."""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to synthesize")
    language: str = Field("en", description="Language code: en, hi, te")


class DataLoadRequest(BaseModel):
    """Request to load CSV datasets."""
    csv_paths: Optional[List[str]] = Field(
        None,
        description="List of CSV file paths to load. If None, loads from default DATA_DIR.",
    )
    rebuild_index: bool = Field(
        True,
        description="Whether to rebuild the FAISS index after loading data.",
    )


# ── Response Models ──────────────────────────────────────────────────────────

class LanguageDetectionResponse(BaseModel):
    """Result of language detection."""
    original_text: str
    detected_language: str = Field(description="Primary detected language code: en, hi, te")
    is_code_mixed: bool = Field(description="Whether the text contains code-mixing")
    language_distribution: Dict[str, float] = Field(
        description="Percentage distribution of each language in the text"
    )
    normalized_text: str = Field(description="Text after normalization")
    token_language_labels: List[Dict[str, str]] = Field(
        description="Per-token language labels: [{'token': ..., 'language': ...}, ...]"
    )


class MedicalEntity(BaseModel):
    """A single extracted medical entity."""
    text: str = Field(description="The entity text span")
    type: str = Field(description="Entity type: symptom, disease, medicine, body_part, duration, doctor_hospital")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score")
    start: int = Field(description="Start character offset in original text")
    end: int = Field(description="End character offset in original text")


class NERResponse(BaseModel):
    """Result of medical named-entity recognition."""
    entities: List[MedicalEntity] = Field(default_factory=list)
    symptoms: List[str] = Field(default_factory=list)
    diseases: List[str] = Field(default_factory=list)
    medicines: List[str] = Field(default_factory=list)
    body_parts: List[str] = Field(default_factory=list)
    durations: List[str] = Field(default_factory=list)
    doctors_hospitals: List[str] = Field(default_factory=list)


class SubIntent(BaseModel):
    """A sub-intent detected within the query."""
    name: str
    confidence: float = Field(ge=0.0, le=1.0)


class IntentResponse(BaseModel):
    """Result of intent classification."""
    intent: str = Field(description="Primary intent category")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence in primary intent")
    sub_intents: List[SubIntent] = Field(default_factory=list, description="Secondary intents detected")


class RetrievedDocument(BaseModel):
    """A single document retrieved by the RAG system."""
    content: str
    source: str = Field(default="", description="Source file or dataset")
    metadata: Dict = Field(default_factory=dict)
    relevance_score: float = Field(ge=0.0, le=1.0)


class RAGResponse(BaseModel):
    """Result of RAG retrieval."""
    retrieved_docs: List[RetrievedDocument] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)
    relevance_scores: List[float] = Field(default_factory=list)


class FullAnalysisResponse(BaseModel):
    """Complete pipeline analysis response."""
    language_detection: LanguageDetectionResponse
    ner: NERResponse
    intent: IntentResponse
    rag: RAGResponse
    generated_response: str = Field(description="Generated healthcare response text")
    explanation: Dict = Field(
        default_factory=dict,
        description="Explainability output showing analysis steps",
    )
    processing_time: float = Field(description="Total processing time in seconds")
    medical_disclaimer: str = Field(
        default=(
            "⚠️ DISCLAIMER: This information is for educational purposes only "
            "and should NOT be considered as medical advice. Please consult a "
            "qualified healthcare professional for diagnosis and treatment."
        )
    )


class VoiceResponse(BaseModel):
    """Response for voice operations."""
    text: Optional[str] = Field(None, description="Transcribed text (for STT)")
    audio_base64: Optional[str] = Field(None, description="Base64-encoded audio (for TTS)")
    language: str = Field(default="en")
    message: str = Field(default="")


class DataStatsResponse(BaseModel):
    """Dataset statistics response."""
    total_records: int = 0
    datasets_loaded: List[str] = Field(default_factory=list)
    language_distribution: Dict[str, int] = Field(default_factory=dict)
    column_names: List[str] = Field(default_factory=list)
    index_built: bool = False
    index_vectors: int = 0


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    version: str = "1.0.0"
    models_loaded: Dict[str, bool] = Field(default_factory=dict)
    data_loaded: bool = False
