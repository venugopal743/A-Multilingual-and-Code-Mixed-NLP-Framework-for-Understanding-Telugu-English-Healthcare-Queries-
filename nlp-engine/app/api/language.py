from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.language_service import language_service

router = APIRouter(prefix="/api", tags=["Language Detection"])


class DetectLanguageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Input text to detect")


@router.post("/detect-language")
async def detect_language_endpoint(payload: DetectLanguageRequest):
    """
    Detects language (Telugu, Hindi, English, Code-Mixed) and returns token-level breakdown.
    """
    return language_service.detect_language(payload.text)
