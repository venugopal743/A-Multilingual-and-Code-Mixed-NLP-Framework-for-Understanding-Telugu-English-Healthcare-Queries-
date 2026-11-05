from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.services.ner_service import ner_service

router = APIRouter(prefix="/api", tags=["Medical NER"])


class NERRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: Optional[str] = "en"


@router.post("/extract-entities")
async def extract_entities_endpoint(payload: NERRequest):
    """
    Extracts symptoms, diseases, medications, body parts, durations, and healthcare providers.
    """
    return ner_service.extract_entities(payload.text, payload.language)
