"""
Core configuration: filesystem paths, vector DB settings, and LLM credentials.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Root of the backend package (backend/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Critical Safeguard 1: Load environment variables at the very top before any getenv calls
if (BASE_DIR / ".env").exists():
    load_dotenv(dotenv_path=BASE_DIR / ".env")
elif (BASE_DIR / ".env.example").exists():
    load_dotenv(dotenv_path=BASE_DIR / ".env.example")

# Storage directories
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DATA_DIR = BASE_DIR / "data" / "processed"
QDRANT_DIR = BASE_DIR / "data" / "qdrant_db"

# Ensure directories exist on import
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
QDRANT_DIR.mkdir(parents=True, exist_ok=True)

# Embedding & Reranking Models (FastEmbed ONNX)
DENSE_EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
SPARSE_EMBEDDING_MODEL = "Qdrant/bm25"
RERANKER_MODEL = "BAAI/bge-reranker-base"
QDRANT_COLLECTION = "research_papers"

# LLM Provider Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower().strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

GEMINI_MODEL = "gemini-2.5-flash"
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b").strip()

# Retrieval & Generation Thresholds
REFUSAL_SCORE_THRESHOLD = -4.5
