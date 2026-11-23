"""
Structure-aware semantic chunker for Docling-parsed documents.

Splits by Markdown section headers (from iterate_items() labels).
Never splits inside a table or display-math block.
Oversized sections are sub-split on element boundaries only.
"""

from __future__ import annotations

import json
from pathlib import Path

from app.core.config import PROCESSED_DATA_DIR
from app.models.schemas import DocumentChunk, PaperMetadata
from app.services.parser_service import ParsedElement

# Maximum characters per chunk (~1 200 tokens)
MAX_CHUNK_CHARS = 4_500


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _group_by_sections(
    elements: list[ParsedElement],
) -> list[tuple[str, list[ParsedElement]]]:
    """
    Walk through parsed elements and group them by section header.

    Elements that appear before the first explicit header are placed under
    "Abstract / Preamble". Consecutive headers without body content collapse
    to the most recent header.
    """
    sections: list[tuple[str, list[ParsedElement]]] = []
    current_header = "Abstract / Preamble"
    current_items: list[ParsedElement] = []

    for elem in elements:
        if elem.label in ("section_header", "title"):
            # Flush the previous section if it has body content
            if current_items:
                sections.append((current_header, current_items))
                current_items = []
            current_header = elem.text
        elif elem.label not in ("page_header", "page_footer"):
            current_items.append(elem)

    # Flush the final section
    if current_items:
        sections.append((current_header, current_items))

    return sections


def _has_table(items: list[ParsedElement]) -> bool:
    """Return True if any element is a table or contains Markdown table syntax."""
    return any(
        item.label == "table"
        or "|---" in item.text
        or "| ---" in item.text
        or "|:---" in item.text
        for item in items
    )


def _has_equation(items: list[ParsedElement]) -> bool:
    """Return True if any element is a formula or contains LaTeX display math."""
    return any(
        item.label == "formula"
        or "$$" in item.text
        or "\\begin{equation" in item.text
        or "\\begin{align" in item.text
        for item in items
    )


def _sub_split(
    items: list[ParsedElement],
    max_chars: int,
) -> list[list[ParsedElement]]:
    """
    Split a list of elements into groups that each fit within *max_chars*.

    Rules:
        - Individual elements (especially tables / formulas) are never split.
        - If a single element alone exceeds the limit, it becomes its own group.
    """
    groups: list[list[ParsedElement]] = []
    current: list[ParsedElement] = []
    current_len = 0

    for item in items:
        item_len = len(item.text)

        # If adding this element would exceed the limit and we already have
        # content, flush the current group first.
        if current and (current_len + 2 + item_len) > max_chars:
            groups.append(current)
            current = []
            current_len = 0

        current.append(item)
        current_len += item_len + 2  # +2 for the "\n\n" join separator

    if current:
        groups.append(current)

    return groups


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def chunk_document(
    paper_id: str,
    paper_title: str,
    elements: list[ParsedElement],
    metadata: PaperMetadata,
    *,
    max_chunk_chars: int = MAX_CHUNK_CHARS,
) -> list[DocumentChunk]:
    """
    Convert a flat list of ParsedElements into semantically grouped chunks.

    Each chunk is bounded by section headers and respects the character limit.

    Args:
        paper_id:        Unique paper identifier.
        paper_title:     Human-readable title of the paper.
        elements:        Output of ``parser_service.parse_pdf()``.
        metadata:        PaperMetadata (unused here but accepted for API symmetry).
        max_chunk_chars: Soft upper limit per chunk (default 4 500 chars ≈ 1 200 tokens).

    Returns:
        Ordered list of DocumentChunk objects.
    """
    sections = _group_by_sections(elements)
    chunks: list[DocumentChunk] = []
    chunk_index = 0

    for header, items in sections:
        combined = "\n\n".join(item.text for item in items)

        if len(combined) <= max_chunk_chars:
            # Entire section fits in one chunk
            chunks.append(
                DocumentChunk(
                    chunk_id=f"{paper_id}_chunk_{chunk_index}",
                    paper_id=paper_id,
                    paper_title=paper_title,
                    section_header=header,
                    page_number=items[0].page_number if items else 1,
                    chunk_index=chunk_index,
                    has_table=_has_table(items),
                    has_equation=_has_equation(items),
                    content=combined,
                )
            )
            chunk_index += 1
        else:
            # Sub-split on element boundaries — tables/formulas stay intact
            for group in _sub_split(items, max_chunk_chars):
                content = "\n\n".join(item.text for item in group)
                chunks.append(
                    DocumentChunk(
                        chunk_id=f"{paper_id}_chunk_{chunk_index}",
                        paper_id=paper_id,
                        paper_title=paper_title,
                        section_header=header,
                        page_number=group[0].page_number if group else 1,
                        chunk_index=chunk_index,
                        has_table=_has_table(group),
                        has_equation=_has_equation(group),
                        content=content,
                    )
                )
                chunk_index += 1

    return chunks


def save_chunks(
    paper_id: str,
    metadata: PaperMetadata,
    chunks: list[DocumentChunk],
) -> Path:
    """
    Serialize metadata + chunks to data/processed/{paper_id}_chunks.json.

    Returns:
        The path to the saved JSON file.
    """
    output = {
        "metadata": metadata.model_dump(),
        "chunks": [c.model_dump() for c in chunks],
    }
    path = PROCESSED_DATA_DIR / f"{paper_id}_chunks.json"
    path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return path
