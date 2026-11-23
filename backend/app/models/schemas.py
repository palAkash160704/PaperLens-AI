"""
Pydantic v2 models for ingestion and hierarchical retrieval.
"""

from typing import Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Phase 1 Ingestion Schemas (Preserved for backwards compatibility)
# ---------------------------------------------------------------------------

class ArxivRequest(BaseModel):
    """Request body for the arXiv ingestion endpoint."""
    arxiv_url_or_id: str = Field(
        ...,
        description="An arXiv paper ID (e.g. '1706.03762') or full URL",
        examples=["1706.03762", "https://arxiv.org/abs/1706.03762"],
    )
    parser_mode: Literal["fast", "precision"] = Field(
        default="fast",
        description="Parser speed mode: 'fast' (~1-2s) or 'precision' (~15s Docling)",
    )


class PaperMetadata(BaseModel):
    """Metadata about an ingested research paper."""
    paper_id: str
    title: str
    authors: list[str] = Field(default_factory=list)
    abstract: str = ""
    published_date: str = ""
    pdf_url: str = ""
    source: Literal["arxiv", "upload"] = "arxiv"


class DocumentChunk(BaseModel):
    """A single semantically meaningful chunk of a parsed document."""
    chunk_id: str
    paper_id: str
    paper_title: str
    section_header: str
    page_number: int = Field(default=1, ge=1)
    chunk_index: int = Field(ge=0)
    has_table: bool = False
    has_equation: bool = False
    content: str


class IngestionResponse(BaseModel):
    """Response returned after a successful ingestion pipeline run."""
    paper_id: str
    metadata: PaperMetadata
    total_chunks: int
    sample_chunks: list[DocumentChunk] = Field(
        default_factory=list,
        description="First 5 chunks as a preview",
    )
    markdown_path: str
    chunks_path: str


# ---------------------------------------------------------------------------
# Phase 2 Hierarchical Indexing & Retrieval Schemas
# ---------------------------------------------------------------------------

class HierarchicalNode(BaseModel):
    """A node in the RAPTOR hierarchical indexing tree (leaf or summary)."""
    node_id: str
    paper_id: str
    paper_title: str
    section_header: str
    page_number: int = Field(default=1, ge=1)
    chunk_index: int = Field(default=0, ge=0)
    node_level: Literal["leaf", "summary"] = "leaf"
    parent_id: str | None = None
    has_table: bool = False
    has_equation: bool = False
    content: str


class IndexResponse(BaseModel):
    """Response returned after hierarchical indexing into Qdrant."""
    paper_id: str
    leaf_nodes_indexed: int
    summary_nodes_indexed: int
    total_indexed: int


class RetrievalRequest(BaseModel):
    """Request body for hybrid search with query routing."""
    query: str = Field(..., description="User search query or question")
    paper_ids: list[str] | None = Field(
        default=None,
        description="Optional list of paper IDs to restrict search to",
    )
    top_k: int = Field(default=5, ge=1, le=50, description="Number of results to return")
    node_level: Literal["auto", "leaf", "summary", "all"] = Field(
        default="auto",
        description="Target granularity: auto routes synthesis vs factual queries",
    )


class RetrievedChunk(BaseModel):
    """A single reranked retrieval result."""
    node_id: str
    paper_id: str
    paper_title: str
    section_header: str
    page_number: int
    node_level: str
    rerank_score: float
    has_table: bool
    has_equation: bool
    content: str


class RetrievalResponse(BaseModel):
    """Final response containing reranked hybrid search results."""
    query: str
    total_results: int
    results: list[RetrievedChunk]


# ---------------------------------------------------------------------------
# Phase 3 Grounded Q&A, Paper Briefing & Comparative Matrix Schemas
# ---------------------------------------------------------------------------

class CitationSource(BaseModel):
    """Metadata for an exact retrieved chunk cited in an answer or brief."""
    citation_index: int
    node_id: str
    paper_id: str
    paper_title: str
    section_header: str
    page_number: int
    snippet: str
    rerank_score: float


class QARequest(BaseModel):
    """Request body for citation-enforced question answering."""
    query: str = Field(..., description="User question about the paper(s)")
    paper_ids: list[str] | None = Field(
        default=None,
        description="Optional list of paper IDs to restrict context to",
    )
    top_k: int = Field(default=5, ge=1, le=20, description="Number of context chunks")


class QAResponse(BaseModel):
    """Grounded question answering response with inline bracketed citations."""
    query: str
    answer: str
    is_grounded: bool
    refusal_reason: str | None = None
    citations: list[CitationSource] = Field(default_factory=list)


class PaperBrief(BaseModel):
    """Automated 5-part structured executive briefing of a paper."""
    paper_id: str
    paper_title: str
    core_problem: str
    proposed_architecture: str
    datasets_and_benchmarks: str
    key_results: str
    stated_limitations: str
    citations: list[CitationSource] = Field(default_factory=list)


class MatrixRequest(BaseModel):
    """Request body to generate a comparative matrix across 2 to 6 papers."""
    paper_ids: list[str] = Field(
        ...,
        min_length=2,
        max_length=6,
        description="List of 2 to 6 paper IDs to compare",
    )
    custom_dimensions: list[str] | None = Field(
        default=None,
        description="Optional list of custom dimensions to extract (e.g. 'Training Objective')",
    )


class MatrixRow(BaseModel):
    """Standardized comparative row for a single paper in the matrix."""
    paper_id: str
    paper_title: str
    published_date: str = ""
    problem_addressed: str
    model_architecture: str
    datasets_used: str
    key_metrics: str
    limitations: str
    custom_fields: dict[str, str] = Field(default_factory=dict)
    citations: list[CitationSource] = Field(default_factory=list)


class MatrixResponse(BaseModel):
    """Multi-paper comparison matrix and synthesis."""
    papers_compared: int
    rows: list[MatrixRow]
    synthesis_takeaway: str


# ---------------------------------------------------------------------------
# Phase 3 Internal LLM Schemas (Technical Fix 1: Gemini & Groq Safe)
# ---------------------------------------------------------------------------

class LLMGeneratedQA(BaseModel):
    """Internal schema for grounded QA generation (safe for Gemini response_schema)."""
    is_grounded: bool
    answer: str
    used_citation_indices: list[int] = Field(default_factory=list)


class LLMPaperBrief(BaseModel):
    """Internal schema for paper brief generation (avoids dict[str, str] & complex types)."""
    core_problem: str
    proposed_architecture: str
    datasets_and_benchmarks: str
    key_results: str
    stated_limitations: str
    used_citation_indices: list[int] = Field(default_factory=list)


class CustomDimensionValue(BaseModel):
    """Key-value pair for custom dimensions (avoids raw untyped dict in LLM schema)."""
    dimension: str
    value: str


class LLMMatrixRow(BaseModel):
    """Internal schema for matrix row extraction."""
    problem_addressed: str
    model_architecture: str
    datasets_used: str
    key_metrics: str
    limitations: str
    custom_dimensions: list[CustomDimensionValue] = Field(default_factory=list)
    used_citation_indices: list[int] = Field(default_factory=list)


class LLMCrossPaperSynthesis(BaseModel):
    """Internal schema for cross-paper synthesis takeaway."""
    synthesis_takeaway: str


# ---------------------------------------------------------------------------
# Phase 4 UI Support Schemas
# ---------------------------------------------------------------------------

class PaperListItem(BaseModel):
    """Summary item for the paper library listing in the UI."""
    paper_id: str
    title: str
    authors: list[str] = Field(default_factory=list)
    published_date: str = ""
    source: str = "arxiv"
    total_chunks: int = 0
    has_brief: bool = False


class PaperContentResponse(BaseModel):
    """Full paper content for the reader pane."""
    metadata: PaperMetadata
    markdown: str
    chunks: list[DocumentChunk] = Field(default_factory=list)


