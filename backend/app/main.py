"""
FastAPI application entry point.

Run with:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.ingest import router as ingest_router
from app.api.routes.retrieval import router as retrieval_router
from app.api.routes.qa import router as qa_router

app = FastAPI(
    title="Research Paper Ingestion, Retrieval & QA API",
    description=(
        "Phase 1, 2, 3 & 4 — Layout-aware PDF ingestion, semantic chunking, "
        "hierarchical RAPTOR indexing, hybrid Dense+Sparse retrieval, "
        "citation-enforced grounded Q&A, paper briefings, multi-paper comparative matrices, "
        "and interactive research workspace UI."
    ),
    version="4.0.0",
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(ingest_router)
app.include_router(retrieval_router)
app.include_router(qa_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["health"])
def health_check():
    """Simple liveness probe and active LLM configuration."""
    from app.services.llm_service import get_active_llm_status
    llm_status = get_active_llm_status()
    return {
        "status": "healthy",
        "phase": 4,
        "provider": llm_status["provider"],
        "live_llm_enabled": llm_status["live_llm_enabled"],
    }


# ---------------------------------------------------------------------------
# Quantitative Evaluation Report
# ---------------------------------------------------------------------------

@app.get("/api/v1/eval/report", tags=["evaluation"])
def get_evaluation_report():
    """Retrieve Phase 5 quantitative evaluation benchmark results."""
    import json
    from app.core.config import BASE_DIR

    results_file = BASE_DIR / "data" / "eval_results.json"
    if not results_file.exists():
        raise HTTPException(
            status_code=404,
            detail="Evaluation results not found. Run evaluate_phase5.py first.",
        )

    try:
        data = json.loads(results_file.read_text(encoding="utf-8"))
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load evaluation results: {exc}",
        ) from exc
