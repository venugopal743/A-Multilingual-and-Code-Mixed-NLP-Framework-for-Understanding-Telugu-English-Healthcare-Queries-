"""
Main FastAPI Application for Multilingual Healthcare NLP Engine.
Endpoints:
- /health : System and Model Health Check
- /api/detect-language : FastText + Indic script language identification
- /api/extract-entities : XLM-RoBERTa / MuRIL Medical NER & symptom extraction
- /api/classify-intent : Fine-tuned MuRIL intent classification
- /api/retrieve : FAISS RAG semantic knowledge retrieval
- /api/chat : Unified end-to-end clinical query pipeline
- /api/voice/transcribe & /synthesize : Whisper STT & Indic-TTS
- /api/data-stats : Knowledge base and model registry telemetry
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.language import router as language_router
from app.api.ner import router as ner_router
from app.api.intent import router as intent_router
from app.api.rag import router as rag_router
from app.api.chat import router as chat_router
from app.api.voice import router as voice_router
from app.api.data_loader import router as data_router
from app.models.model_manager import model_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("healthcare-nlp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Multilingual Healthcare NLP Engine...")
    logger.info("Loading FastText, MuRIL, XLM-RoBERTa, and FAISS Knowledge Base...")
    yield
    logger.info("Shutting down NLP Engine.")


app = FastAPI(
    title="Multilingual & Code-Mixed Healthcare NLP Framework",
    description="NLP Engine for understanding Telugu, Hindi, English, and Code-Mixed healthcare queries.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for React frontend (Vite port 5173, backend port 5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(language_router)
app.include_router(ner_router)
app.include_router(intent_router)
app.include_router(rag_router)
app.include_router(chat_router)
app.include_router(voice_router)
app.include_router(data_router)


@app.get("/")
async def root():
    return {
        "framework": "Multilingual Healthcare NLP Engine",
        "supported_languages": ["Telugu", "Hindi", "English", "Code-Mixed"],
        "docs_url": "/docs",
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "models": model_manager.get_status(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
