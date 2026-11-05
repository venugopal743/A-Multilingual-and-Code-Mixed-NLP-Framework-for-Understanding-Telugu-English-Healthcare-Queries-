from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.services.intent_service import intent_service

router = APIRouter(prefix="/api", tags=["Intent Classification"])


class IntentRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: Optional[str] = "en"


@router.post("/classify-intent")
async def classify_intent_endpoint(payload: IntentRequest):
    """
    Classifies healthcare query into 8 distinct intent categories.
    """
    return intent_service.classify_intent(payload.text, payload.language)
