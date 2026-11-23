"""
FastAPI routes for hierarchical indexing and hybrid retrieval.
All endpoints use synchronous ``def`` so CPU-bound embedding and reranking
runs in FastAPI's threadpool without blocking the async event loop.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    IndexResponse,
    RetrievalRequest,
    RetrievalResponse,
)
from app.services.raptor_service import build_hierarchical_nodes
from app.services.retriever_service import search_and_rerank
from app.services.vector_store_service import index_nodes

router = APIRouter(prefix="/api/v1", tags=["retrieval"])


@router.post("/index/{paper_id}", response_model=IndexResponse)
def index_paper(paper_id: str):
    """
    Build hierarchical RAPTOR nodes (Level 0 leaf nodes + Level 1 summary nodes)
    and index them into the persistent local Qdrant collection with dense and sparse vectors.
    """
    try:
        nodes = build_hierarchical_nodes(paper_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to build hierarchical nodes: {exc}"
        ) from exc

    try:
        total_indexed = index_nodes(nodes)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to index nodes into Qdrant: {exc}"
        ) from exc

    leaf_count = sum(1 for n in nodes if n.node_level == "leaf")
    summary_count = sum(1 for n in nodes if n.node_level == "summary")

    return IndexResponse(
        paper_id=paper_id,
        leaf_nodes_indexed=leaf_count,
        summary_nodes_indexed=summary_count,
        total_indexed=total_indexed,
    )


@router.post("/retrieve/search", response_model=RetrievalResponse)
def retrieve_search(request: RetrievalRequest):
    """
    Execute hybrid search (Dense + BM25 via Reciprocal Rank Fusion)
    followed by BGE Cross-Encoder reranking.
    """
    try:
        results = search_and_rerank(
            query=request.query,
            paper_ids=request.paper_ids,
            top_k=request.top_k,
            node_level=request.node_level,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Hybrid search failed: {exc}"
        ) from exc

    return RetrievalResponse(
        query=request.query,
        total_results=len(results),
        results=results,
    )
