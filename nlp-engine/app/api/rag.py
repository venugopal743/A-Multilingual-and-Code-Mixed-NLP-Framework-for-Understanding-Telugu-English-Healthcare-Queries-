from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["Medical RAG"])


class RetrieveRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)
    top_k: Optional[int] = 3


@router.post("/retrieve")
async def retrieve_endpoint(payload: RetrieveRequest):
    """
    Retrieves top relevant medical documents and clinical source references.
    """
    return rag_service.retrieve(payload.query, payload.top_k)
