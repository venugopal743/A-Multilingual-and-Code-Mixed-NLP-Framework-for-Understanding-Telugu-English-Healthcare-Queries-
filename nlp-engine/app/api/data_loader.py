from fastapi import APIRouter
from app.services.rag_service import rag_service
from app.models.model_manager import model_manager

router = APIRouter(prefix="/api", tags=["Data Loader & Model Registry"])


@router.get("/data-stats")
async def get_data_stats():
    """
    Returns statistics about indexed medical records and model status.
    """
    return {
        "indexed_documents": len(rag_service.documents),
        "supported_languages": ["te", "hi", "en", "te-en", "hi-en"],
        "models": model_manager.get_status(),
    }


@router.post("/load-data")
async def reload_dataset():
    """
    Reloads medical dataset records into memory and vector index.
    """
    rag_service.documents.clear()
    rag_service._load_initial_records()
    return {
        "status": "success",
        "total_records_indexed": len(rag_service.documents),
    }
