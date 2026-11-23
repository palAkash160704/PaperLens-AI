"""
FastAPI routes for grounded Q&A, structured paper briefings, and multi-paper comparative matrices.
All routes use synchronous ``def`` so that CPU-bound embedding, reranking, and local Qdrant
operations run cleanly in FastAPI's worker threadpool without blocking the async event loop.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    MatrixRequest,
    MatrixResponse,
    PaperBrief,
    QARequest,
    QAResponse,
)
from app.services.brief_service import generate_paper_brief
from app.services.matrix_service import compare_papers
from app.services.qa_service import answer_question

router = APIRouter(prefix="/api/v1", tags=["qa_and_synthesis"])


# ---------------------------------------------------------------------------
# POST /api/v1/qa/ask
# ---------------------------------------------------------------------------

@router.post("/qa/ask", response_model=QAResponse)
def ask_question_endpoint(request: QARequest):
    """
    Ask a question grounded strictly in the indexed paper(s).
    Features dual-layer anti-hallucination refusal and inline bracketed citations.
    """
    try:
        return answer_question(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Question answering failed: {exc}"
        ) from exc


# ---------------------------------------------------------------------------
# GET /api/v1/papers/{paper_id}/brief
# ---------------------------------------------------------------------------

@router.get("/papers/{paper_id}/brief", response_model=PaperBrief)
def get_paper_brief_endpoint(paper_id: str):
    """
    Retrieve or generate a 5-part structured executive briefing for a paper.
    Cached on disk at data/processed/{paper_id}_brief.json for zero-latency repeats.
    """
    try:
        return generate_paper_brief(paper_id=paper_id, force_refresh=False)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404, detail=f"Paper '{paper_id}' not found. Ingest it first: {exc}"
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate paper brief: {exc}"
        ) from exc


# ---------------------------------------------------------------------------
# POST /api/v1/papers/{paper_id}/brief
# ---------------------------------------------------------------------------

@router.post("/papers/{paper_id}/brief", response_model=PaperBrief)
def refresh_paper_brief_endpoint(
    paper_id: str,
    force_refresh: bool = Query(
        default=True,
        description="Whether to force regeneration and overwrite the cached brief",
    ),
):
    """
    Regenerate the 5-part structured executive briefing for a paper, overwriting disk cache.
    """
    try:
        return generate_paper_brief(paper_id=paper_id, force_refresh=force_refresh)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404, detail=f"Paper '{paper_id}' not found. Ingest it first: {exc}"
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to regenerate paper brief: {exc}"
        ) from exc


# ---------------------------------------------------------------------------
# POST /api/v1/matrix/compare
# ---------------------------------------------------------------------------

@router.post("/matrix/compare", response_model=MatrixResponse)
def compare_papers_endpoint(request: MatrixRequest):
    """
    Generate a side-by-side comparative matrix across 2 to 6 papers with cross-paper synthesis.
    """
    try:
        return compare_papers(
            paper_ids=request.paper_ids,
            custom_dimensions=request.custom_dimensions,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Matrix comparison failed: {exc}"
        ) from exc
