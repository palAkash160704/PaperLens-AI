"""
Persistent local Qdrant vector store with Dense (BGE) + Sparse (BM25) vectors.
Thread-safe singleton client for local embedded disk storage.
"""

from __future__ import annotations

import logging
import threading
import uuid
from typing import Final

from fastembed import SparseTextEmbedding, TextEmbedding
from qdrant_client import QdrantClient, models

from app.core.config import (
    DENSE_EMBEDDING_MODEL,
    QDRANT_COLLECTION,
    QDRANT_DIR,
    SPARSE_EMBEDDING_MODEL,
)
from app.models.schemas import HierarchicalNode

logger = logging.getLogger(__name__)

# Critical Safeguard 2: Process-wide lock for thread-safe access to embedded local Qdrant storage
_QDRANT_LOCK: Final[threading.Lock] = threading.Lock()

_client: QdrantClient | None = None
_dense_model: TextEmbedding | None = None
_sparse_model: SparseTextEmbedding | None = None


def get_qdrant_client() -> QdrantClient:
    """Get or initialize the thread-safe embedded QdrantClient singleton."""
    global _client
    if _client is None:
        with _QDRANT_LOCK:
            if _client is None:
                _client = QdrantClient(path=str(QDRANT_DIR))
                _ensure_collection(_client)
    return _client


def _get_embedding_models() -> tuple[TextEmbedding, SparseTextEmbedding]:
    """Get or initialize FastEmbed dense and sparse models."""
    global _dense_model, _sparse_model
    if _dense_model is None or _sparse_model is None:
        with _QDRANT_LOCK:
            if _dense_model is None:
                _dense_model = TextEmbedding(model_name=DENSE_EMBEDDING_MODEL)
            if _sparse_model is None:
                _sparse_model = SparseTextEmbedding(model_name=SPARSE_EMBEDDING_MODEL)
    return _dense_model, _sparse_model


def _ensure_collection(client: QdrantClient) -> None:
    """Ensure the target dual-vector collection exists in Qdrant."""
    collections = client.get_collections().collections
    exists = any(c.name == QDRANT_COLLECTION for c in collections)
    if not exists:
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config={
                "dense": models.VectorParams(
                    size=384,  # BGE-small-en-v1.5 dimension
                    distance=models.Distance.COSINE,
                )
            },
            sparse_vectors_config={
                "bm25": models.SparseVectorParams(
                    modifier=models.Modifier.IDF,
                )
            },
        )
        logger.info("Created Qdrant dual-vector collection: %s", QDRANT_COLLECTION)


def delete_paper_points(paper_id: str) -> None:
    """
    Critical Safeguard 2: Delete any existing points for paper_id before re-indexing.
    """
    client = get_qdrant_client()
    with _QDRANT_LOCK:
        client.delete(
            collection_name=QDRANT_COLLECTION,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="paper_id",
                            match=models.MatchValue(value=paper_id),
                        )
                    ]
                )
            ),
        )


def index_nodes(nodes: list[HierarchicalNode]) -> int:
    """
    Generate dense and sparse embeddings for hierarchical nodes and upsert them into Qdrant.

    Args:
        nodes: List of HierarchicalNode objects (leaf and summary).

    Returns:
        Number of points upserted.
    """
    if not nodes:
        return 0

    paper_id = nodes[0].paper_id

    # 1. Clean stale nodes for this paper first
    delete_paper_points(paper_id)

    # 2. Extract contents
    texts = [n.content for n in nodes]
    dense_model, sparse_model = _get_embedding_models()

    # Generate embeddings
    dense_embeddings = list(dense_model.embed(texts))
    sparse_embeddings = list(sparse_model.embed(texts))

    points: list[models.PointStruct] = []

    for node, dense_emb, sparse_emb in zip(nodes, dense_embeddings, sparse_embeddings):
        # Local Qdrant requires valid UUID or integer point IDs
        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, node.node_id))

        # Critical Safeguard 2: Explicitly convert sparse outputs to lists of primitives
        sparse_vector = models.SparseVector(
            indices=sparse_emb.indices.tolist(),
            values=sparse_emb.values.tolist(),
        )

        point = models.PointStruct(
            id=point_id,
            vector={
                "dense": dense_emb.tolist(),
                "bm25": sparse_vector,
            },
            payload=node.model_dump(),
        )
        points.append(point)

    # 3. Thread-safe upsert into Qdrant
    client = get_qdrant_client()
    with _QDRANT_LOCK:
        client.upsert(
            collection_name=QDRANT_COLLECTION,
            points=points,
        )

    return len(points)
