"""
Application configuration using Pydantic BaseSettings.
All configurable parameters for the multilingual healthcare NLP engine.
"""

import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings
from pydantic import Field


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables and .env file."""

    # Application
    APP_NAME: str = "Multilingual Healthcare NLP Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Directories
    MODEL_DIR: str = str(BASE_DIR / "models" / "saved")
    DATA_DIR: str = str(BASE_DIR / "data" / "raw")
    PROCESSED_DATA_DIR: str = str(BASE_DIR / "data" / "processed")
    KNOWLEDGE_BASE_DIR: str = str(BASE_DIR / "data" / "knowledge_base")
    FAISS_INDEX_PATH: str = str(BASE_DIR / "models" / "embeddings" / "faiss_index")
    EMBEDDINGS_DIR: str = str(BASE_DIR / "models" / "embeddings")

    # Embedding model
    EMBEDDING_MODEL_NAME: str = "paraphrase-multilingual-MiniLM-L12-v2"

    # RAG configuration
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.3
    RAG_CHUNK_SIZE: int = 512
    RAG_CHUNK_OVERLAP: int = 50

    # OpenAI (optional)
    OPENAI_API_KEY: Optional[str] = None

    # Logging
    LOG_LEVEL: str = "INFO"

    # Supported languages
    SUPPORTED_LANGUAGES: list = ["en", "hi", "te"]
    SUPPORTED_CODE_MIXED: list = ["te-en", "hi-en"]

    # CORS
    CORS_ORIGINS: list = ["*"]

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }

    def ensure_directories(self) -> None:
        """Create all required directories if they don't exist."""
        for dir_path in [
            self.MODEL_DIR,
            self.DATA_DIR,
            self.PROCESSED_DATA_DIR,
            self.KNOWLEDGE_BASE_DIR,
            self.EMBEDDINGS_DIR,
        ]:
            os.makedirs(dir_path, exist_ok=True)


settings = Settings()
