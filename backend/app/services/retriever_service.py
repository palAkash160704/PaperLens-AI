"""
Two-stage Hybrid Retriever with query granularity routing, RRF fusion,
and FastEmbed Cross-Encoder reranking.
"""

from __future__ import annotations

import logging
import threading
from typing import Final, Literal

from fastembed import SparseTextEmbedding, TextEmbedding
from fastembed.rerank.cross_encoder import TextCrossEncoder
from qdrant_client import models

from app.core.config import (
    DENSE_EMBEDDING_MODEL,
    QDRANT_COLLECTION,
    RERANKER_MODEL,
    SPARSE_EMBEDDING_MODEL,
)
from app.models.schemas import RetrievedChunk
from app.services.vector_store_service import _QDRANT_LOCK, get_qdrant_client

logger = logging.getLogger(__name__)

_reranker_model: TextCrossEncoder | None = None
_dense_model: TextEmbedding | None = None
_sparse_model: SparseTextEmbedding | None = None
_MODEL_LOCK: Final[threading.Lock] = threading.Lock()

# Keywords indicating broad synthesis queries
_SYNTHESIS_KEYWORDS: Final[set[str]] = {
    "summarize", "summarise", "summary", "overview", "architecture", "methodology",
    "contribution", "contributions", "compare", "comparison", "main idea",
    "explain", "background", "motivation", "conclusion", "synopsis",
}

# Keywords indicating specific factual or metric queries
_FACTUAL_KEYWORDS: Final[set[str]] = {
    "bleu", "score", "table", "formula", "equation", "learning rate",
    "hyperparameter", "batch", "d_model", "layers", "benchmark",
    "wmt", "accuracy", "percentage", "parameter", "loss", "optimizer",
}


def _get_models() -> tuple[TextEmbedding, SparseTextEmbedding, TextCrossEncoder]:
    """Initialize FastEmbed dense, sparse, and cross-encoder models."""
    global _dense_model, _sparse_model, _reranker_model
    if _dense_model is None or _sparse_model is None or _reranker_model is None:
        with _MODEL_LOCK:
            if _dense_model is None:
                _dense_model = TextEmbedding(model_name=DENSE_EMBEDDING_MODEL)
            if _sparse_model is None:
                _sparse_model = SparseTextEmbedding(model_name=SPARSE_EMBEDDING_MODEL)
            if _reranker_model is None:
                _reranker_model = TextCrossEncoder(model_name=RERANKER_MODEL)
    return _dense_model, _sparse_model, _reranker_model


def is_synthesis_query(query: str) -> bool:
    """Return True if the query appears to be a broad synthesis question."""
    tokens = set(query.lower().split())
    return any(kw in tokens or kw in query.lower() for kw in _SYNTHESIS_KEYWORDS)


def search_and_rerank(
    query: str,
    paper_ids: list[str] | None = None,
    top_k: int = 5,
    node_level: Literal["auto", "leaf", "summary", "all"] = "auto",
) -> list[RetrievedChunk]:
    """
    Execute Two-Stage Hybrid Retrieval:
    Stage 1: Dense + Sparse BM25 Prefetch fused via Reciprocal Rank Fusion (RRF).
    Stage 2: Cross-Encoder reranking using BGE-reranker-base.

    Args:
        query: User search query.
        paper_ids: Optional list of paper IDs to filter by.
        top_k: Number of reranked results to return.
        node_level: "auto", "leaf", "summary", or "all".

    Returns:
        List of RetrievedChunk instances ordered by rerank_score descending.
    """
    dense_model, sparse_model, reranker = _get_models()
    client = get_qdrant_client()

    # 1. Encode query
    dense_query_vec = list(dense_model.embed([query]))[0].tolist()
    sparse_query_emb = list(sparse_model.embed([query]))[0]

    # Critical Safeguard 2: Explicitly convert sparse outputs to lists
    sparse_query_vec = models.SparseVector(
        indices=sparse_query_emb.indices.tolist(),
        values=sparse_query_emb.values.tolist(),
    )

    # 2. Build filters
    must_conditions: list[models.FieldCondition] = []
    if paper_ids:
        if len(paper_ids) == 1:
            must_conditions.append(
                models.FieldCondition(
                    key="paper_id",
                    match=models.MatchValue(value=paper_ids[0]),
                )
            )
        else:
            must_conditions.append(
                models.FieldCondition(
                    key="paper_id",
                    match=models.MatchAny(any=paper_ids),
                )
            )

    # Query granularity router decision
    is_synthesis = is_synthesis_query(query)
    effective_level = node_level
    if node_level == "auto":
        # Keep unfiltered or auto-routed
        pass
    elif node_level in ("leaf", "summary"):
        must_conditions.append(
            models.FieldCondition(
                key="node_level",
                match=models.MatchValue(value=node_level),
            )
        )

    base_filter = models.Filter(must=must_conditions) if must_conditions else None

    # Stage 1: Build Prefetch branches for Hybrid RRF
    prefetches = [
        models.Prefetch(
            query=dense_query_vec,
            using="dense",
            limit=15,
            filter=base_filter,
        ),
        models.Prefetch(
            query=sparse_query_vec,
            using="bm25",
            limit=15,
            filter=base_filter,
        ),
    ]

    # Critical Safeguard 4: If broad synthesis in auto mode, add a dedicated summary prefetch branch
    if node_level == "auto" and is_synthesis:
        summary_filter_conditions = list(must_conditions)
        summary_filter_conditions.append(
            models.FieldCondition(
                key="node_level",
                match=models.MatchValue(value="summary"),
            )
        )
        prefetches.append(
            models.Prefetch(
                query=dense_query_vec,
                using="dense",
                limit=10,
                filter=models.Filter(must=summary_filter_conditions),
            )
        )

    # Execute Hybrid RRF Query
    with _QDRANT_LOCK:
        response = client.query_points(
            collection_name=QDRANT_COLLECTION,
            prefetch=prefetches,
            query=models.FusionQuery(fusion=models.Fusion.RRF),
            limit=20,  # Retrieve top 20 candidates for Stage 2 reranking
            with_payload=True,
        )

    candidates = response.points
    if not candidates:
        return []

    # 3. Stage 2: Cross-Encoder Reranking
    passages = [str(p.payload.get("content", "")) for p in candidates]

    # Critical Safeguard 4: fastembed TextCrossEncoder.rerank(query, docs) yields plain float scores
    scores_generator = reranker.rerank(query, passages)
    scores = [float(s) for s in scores_generator]

    scored_candidates = list(zip(candidates, scores))
    # Sort descending by rerank score
    scored_candidates.sort(key=lambda item: item[1], reverse=True)

    # 4. Format into RetrievedChunk models
    results: list[RetrievedChunk] = []
    for point, score in scored_candidates[:top_k]:
        payload = point.payload or {}
        chunk = RetrievedChunk(
            node_id=str(payload.get("node_id", point.id)),
            paper_id=str(payload.get("paper_id", "")),
            paper_title=str(payload.get("paper_title", "")),
            section_header=str(payload.get("section_header", "")),
            page_number=int(payload.get("page_number", 1)),
            node_level=str(payload.get("node_level", "leaf")),
            rerank_score=score,
            has_table=bool(payload.get("has_table", False)),
            has_equation=bool(payload.get("has_equation", False)),
            content=str(payload.get("content", "")),
        )
        results.append(chunk)

    return results


# Alias matching alternative caller conventions
search = search_and_rerank

