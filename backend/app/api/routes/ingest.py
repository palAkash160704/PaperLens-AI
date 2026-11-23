"""
Ingestion API endpoints.

All heavy-work endpoints use plain ``def`` (synchronous) so that FastAPI
runs them in a threadpool — Docling's CPU-bound parsing never blocks the
async event loop.
"""

from __future__ import annotations

import json
import re
import uuid
from pathlib import Path

from typing import Literal

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.core.config import PROCESSED_DATA_DIR, RAW_DATA_DIR
from app.models.schemas import (
    ArxivRequest,
    DocumentChunk,
    IngestionResponse,
    PaperContentResponse,
    PaperListItem,
    PaperMetadata,
)
from app.services.arxiv_service import fetch_arxiv_paper
from app.services.chunker_service import chunk_document, save_chunks
from app.services.parser_service import parse_pdf

router = APIRouter(prefix="/api/v1/ingest", tags=["ingestion"])


def _extract_real_title(elements: list, default: str) -> str:
    """
    Extract the true academic title from the earliest elements of the parsed PDF,
    filtering out publisher clutter, journal headers, and URLs.
    """
    ignore_patterns = [
        r"contents\s+lists\s+available",
        r"sciencedirect",
        r"elsevier",
        r"journal\s+homepage",
        r"journal\s+of",
        r"international\s+journal",
        r"arxiv:\d+\.\d+",
        r"ieee\s+transactions",
        r"proceedings\s+of",
        r"springer",
        r"doi\.org",
        r"http[s]?://",
        r"^page\s+\d+",
        r"^volume\s+\d+",
        r"^\d{4}\s+elsevier",
        r"^article\s+info",
        r"^abstract",
    ]
    compiled_ignore = [re.compile(p, re.IGNORECASE) for p in ignore_patterns]

    for elem in elements[:15]:
        txt = elem.text.strip().replace("\n", " ")
        if len(txt) < 8 or len(txt) > 280:
            continue
        if any(p.search(txt) for p in compiled_ignore):
            continue
        # Prominent title or section header
        if getattr(elem, "label", "") in ("title", "section_header") or getattr(elem, "heading_level", 0) == 1:
            clean = re.sub(r"[\s*#]+$", "", txt).strip()
            if clean:
                return clean
        if getattr(elem, "label", "") == "text" and getattr(elem, "page_number", 1) == 1 and not txt.endswith("."):
            if 15 < len(txt) < 180:
                return txt

    return default


# ---------------------------------------------------------------------------
# POST /api/v1/ingest/upload
# ---------------------------------------------------------------------------

@router.post("/upload", response_model=IngestionResponse)
def ingest_upload(
    file: UploadFile = File(...),
    parser_mode: Literal["fast", "precision"] = Form("fast"),
):
    """
    Upload a PDF and run the full ingestion pipeline.

    A 6-character UUID suffix is appended to the filename to prevent
    collisions from repeated uploads of the same file.
    """
    # --- Validate ----------------------------------------------------------
    filename = file.filename or "uploaded.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # --- Generate unique paper_id ------------------------------------------
    base_name = Path(filename).stem
    base_name = re.sub(r"[^\w\-]", "_", base_name)
    suffix = uuid.uuid4().hex[:6]
    paper_id = f"{base_name}_{suffix}"

    # --- Save uploaded PDF -------------------------------------------------
    pdf_path = RAW_DATA_DIR / f"{paper_id}.pdf"
    try:
        contents = file.file.read()
        pdf_path.write_bytes(contents)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to save uploaded file: {exc}"
        ) from exc
    finally:
        file.file.close()

    # --- Parse & chunk -----------------------------------------------------
    try:
        _markdown, elements = parse_pdf(pdf_path, paper_id, mode=parser_mode)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # --- Extract real academic title from parsed elements -----------------
    extracted_title = _extract_real_title(elements, default=Path(filename).stem)
    metadata = PaperMetadata(
        paper_id=paper_id,
        title=extracted_title,
        source="upload",
    )

    chunks = chunk_document(paper_id, metadata.title, elements, metadata)
    chunks_path = save_chunks(paper_id, metadata, chunks)

    return IngestionResponse(
        paper_id=paper_id,
        metadata=metadata,
        total_chunks=len(chunks),
        sample_chunks=chunks[:5],
        markdown_path=str(PROCESSED_DATA_DIR / f"{paper_id}.md"),
        chunks_path=str(chunks_path),
    )


# ---------------------------------------------------------------------------
# POST /api/v1/ingest/arxiv
# ---------------------------------------------------------------------------

@router.post("/arxiv", response_model=IngestionResponse)
def ingest_arxiv(request: ArxivRequest):
    """
    Ingest a paper from arXiv by ID or URL.

    Downloads the PDF, parses it with Docling, and runs semantic chunking.
    """
    # --- Fetch from arXiv --------------------------------------------------
    try:
        metadata, pdf_path = fetch_arxiv_paper(request.arxiv_url_or_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # --- Parse & chunk -----------------------------------------------------
    try:
        _markdown, elements = parse_pdf(pdf_path, metadata.paper_id, mode=request.parser_mode)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    chunks = chunk_document(
        metadata.paper_id, metadata.title, elements, metadata
    )
    chunks_path = save_chunks(metadata.paper_id, metadata, chunks)

    return IngestionResponse(
        paper_id=metadata.paper_id,
        metadata=metadata,
        total_chunks=len(chunks),
        sample_chunks=chunks[:5],
        markdown_path=str(PROCESSED_DATA_DIR / f"{metadata.paper_id}.md"),
        chunks_path=str(chunks_path),
    )


# ---------------------------------------------------------------------------
# GET /api/v1/ingest/papers
# ---------------------------------------------------------------------------

@router.get("/papers", response_model=list[PaperListItem])
def list_papers():
    """
    List all ingested papers by scanning PROCESSED_DATA_DIR for *_chunks.json files.
    """
    papers: list[PaperListItem] = []
    if not PROCESSED_DATA_DIR.exists():
        return papers

    for chunks_file in sorted(PROCESSED_DATA_DIR.glob("*_chunks.json")):
        paper_id = chunks_file.name.replace("_chunks.json", "")
        brief_file = PROCESSED_DATA_DIR / f"{paper_id}_brief.json"
        has_brief = brief_file.exists()

        try:
            data = json.loads(chunks_file.read_text(encoding="utf-8"))
            meta = data.get("metadata", {})
            total_chunks = len(data.get("chunks", []))
            papers.append(
                PaperListItem(
                    paper_id=paper_id,
                    title=meta.get("title", paper_id),
                    authors=meta.get("authors", []),
                    published_date=meta.get("published_date", ""),
                    source=meta.get("source", "arxiv"),
                    total_chunks=total_chunks,
                    has_brief=has_brief,
                )
            )
        except Exception:
            # Skip unreadable or corrupted files gracefully
            continue

    return papers


# ---------------------------------------------------------------------------
# GET /api/v1/ingest/papers/{paper_id}
# ---------------------------------------------------------------------------

@router.get("/papers/{paper_id}", response_model=IngestionResponse)
def get_paper(paper_id: str):
    """
    Retrieve previously ingested paper data (metadata + sample chunks).
    """
    chunks_path = PROCESSED_DATA_DIR / f"{paper_id}_chunks.json"
    if not chunks_path.exists():
        raise HTTPException(
            status_code=404, detail=f"Paper '{paper_id}' not found."
        )

    try:
        data = json.loads(chunks_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        raise HTTPException(
            status_code=500, detail=f"Could not read chunks file: {exc}"
        ) from exc

    metadata = PaperMetadata(**data["metadata"])
    all_chunks = [DocumentChunk(**c) for c in data["chunks"]]

    return IngestionResponse(
        paper_id=paper_id,
        metadata=metadata,
        total_chunks=len(all_chunks),
        sample_chunks=all_chunks[:5],
        markdown_path=str(PROCESSED_DATA_DIR / f"{paper_id}.md"),
        chunks_path=str(chunks_path),
    )


# ---------------------------------------------------------------------------
# GET /api/v1/ingest/papers/{paper_id}/content
# ---------------------------------------------------------------------------

@router.get("/papers/{paper_id}/content", response_model=PaperContentResponse)
def get_paper_content(paper_id: str):
    """
    Load full paper markdown and chunks for the reader pane.
    """
    chunks_path = PROCESSED_DATA_DIR / f"{paper_id}_chunks.json"
    md_path = PROCESSED_DATA_DIR / f"{paper_id}.md"

    if not chunks_path.exists():
        raise HTTPException(
            status_code=404, detail=f"Paper '{paper_id}' not found."
        )

    try:
        data = json.loads(chunks_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        raise HTTPException(
            status_code=500, detail=f"Could not read chunks file: {exc}"
        ) from exc

    metadata = PaperMetadata(**data.get("metadata", {}))
    chunks = [DocumentChunk(**c) for c in data.get("chunks", [])]

    markdown = ""
    if md_path.exists():
        try:
            markdown = md_path.read_text(encoding="utf-8")
        except OSError:
            markdown = ""

    return PaperContentResponse(
        metadata=metadata,
        markdown=markdown,
        chunks=chunks,
    )


# ---------------------------------------------------------------------------
# GET /api/v1/ingest/papers/{paper_id}/pdf
# ---------------------------------------------------------------------------

@router.get("/papers/{paper_id}/pdf")
def get_paper_pdf(paper_id: str):
    """
    Serve original PDF file inline for iframe viewing.
    """
    pdf_path = RAW_DATA_DIR / f"{paper_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail=f"PDF for paper '{paper_id}' not found.")
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"},
    )

