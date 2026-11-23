"""
RAPTOR-lite hierarchical index builder:
Converts Level 0 leaf chunks into Level 1 section summaries and a global paper executive summary.
"""

from __future__ import annotations

import json
from pathlib import Path

from app.core.config import PROCESSED_DATA_DIR
from app.models.schemas import DocumentChunk, HierarchicalNode
from app.services.llm_service import _extractive_fallback_summary, generate_summary

# Critical Safeguard 3: Skip LLM summarization for trivial sections shorter than 400 characters
MIN_SECTION_CHARS_FOR_SUMMARY = 400


def build_hierarchical_nodes(paper_id: str) -> list[HierarchicalNode]:
    """
    Construct Level 0 (leaf) and Level 1 (summary) nodes for a paper.

    Args:
        paper_id: Unique paper identifier.

    Returns:
        List of HierarchicalNode objects (both leaf and summary).

    Raises:
        FileNotFoundError: If the Phase 1 processed chunks JSON file does not exist.
    """
    chunks_path = PROCESSED_DATA_DIR / f"{paper_id}_chunks.json"
    if not chunks_path.exists():
        raise FileNotFoundError(
            f"Processed chunks not found for paper '{paper_id}' at {chunks_path}. Run Phase 1 ingestion first."
        )

    raw_data = json.loads(chunks_path.read_text(encoding="utf-8"))
    metadata = raw_data.get("metadata", {})
    paper_title = metadata.get("title", f"Paper {paper_id}")
    raw_chunks = raw_data.get("chunks", [])

    leaf_nodes: list[HierarchicalNode] = []
    sections: dict[str, list[DocumentChunk]] = {}

    # --- 1. Level 0: Leaf Nodes -------------------------------------------
    for c_dict in raw_chunks:
        chunk = DocumentChunk(**c_dict)
        node = HierarchicalNode(
            node_id=chunk.chunk_id,
            paper_id=chunk.paper_id,
            paper_title=chunk.paper_title,
            section_header=chunk.section_header,
            page_number=chunk.page_number,
            chunk_index=chunk.chunk_index,
            node_level="leaf",
            has_table=chunk.has_table,
            has_equation=chunk.has_equation,
            content=chunk.content,
        )
        leaf_nodes.append(node)

        # Group by section header for Level 1 summaries
        sec = chunk.section_header.strip()
        if sec:
            sections.setdefault(sec, []).append(chunk)

    # --- 2. Level 1: Section Summaries (Parallelized with ThreadPoolExecutor) ---
    summary_nodes: list[HierarchicalNode] = []
    section_summary_texts: list[str] = []

    # Filter eligible sections (>= MIN_SECTION_CHARS_FOR_SUMMARY)
    major_keywords = ("abstract", "intro", "architecture", "model", "method", "approach", "result", "experiment", "conclus")
    prioritized_sections: list[tuple[int, str, list[DocumentChunk], str]] = []
    secondary_sections: list[tuple[int, str, list[DocumentChunk], str]] = []
    sec_idx = 0

    for section_header, sec_chunks in sections.items():
        combined_text = "\n\n".join(c.content for c in sec_chunks)
        if len(combined_text) >= MIN_SECTION_CHARS_FOR_SUMMARY:
            item = (sec_idx, section_header, sec_chunks, combined_text)
            if any(k in section_header.lower() for k in major_keywords):
                prioritized_sections.append(item)
            else:
                secondary_sections.append(item)
            sec_idx += 1

    # Cap LLM summarization to top 4 major sections to strictly stay within Groq rate limits (~1000 OTPM)
    # Remaining sections receive instant deterministic extractive summaries
    llm_candidates = (prioritized_sections + secondary_sections)[:4]
    llm_indices = {item[0] for item in llm_candidates}
    all_eligible = prioritized_sections + secondary_sections

    from concurrent.futures import ThreadPoolExecutor, as_completed

    def _summarize_section(item: tuple[int, str, list[DocumentChunk], str]) -> tuple[int, str, list[DocumentChunk], str]:
        idx, sec_hdr, sec_chnks, text = item
        if idx in llm_indices:
            try:
                summary = generate_summary(text, sec_hdr, paper_title)
            except Exception:
                summary = _extractive_fallback_summary(text, sec_hdr, paper_title)
        else:
            summary = _extractive_fallback_summary(text, sec_hdr, paper_title)
        return idx, sec_hdr, sec_chnks, summary

    summarized_results: list[tuple[int, str, list[DocumentChunk], str]] = []
    if all_eligible:
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(_summarize_section, item) for item in all_eligible]
            for future in as_completed(futures):
                try:
                    summarized_results.append(future.result())
                except Exception:
                    pass

    # Sort results by original idx to maintain sequential section order
    summarized_results.sort(key=lambda x: x[0])

    for idx, section_header, sec_chunks, summary_text in summarized_results:
        section_summary_texts.append(f"### {section_header}\n{summary_text}")
        first_chunk = sec_chunks[0]
        has_tbl = any(c.has_table for c in sec_chunks)
        has_eq = any(c.has_equation for c in sec_chunks)

        summary_node = HierarchicalNode(
            node_id=f"{paper_id}_sec_summary_{idx}",
            paper_id=paper_id,
            paper_title=paper_title,
            section_header=section_header,
            page_number=first_chunk.page_number,
            chunk_index=idx,
            node_level="summary",
            has_table=has_tbl,
            has_equation=has_eq,
            content=summary_text,
        )
        summary_nodes.append(summary_node)

    # --- 3. Level 1: Global Paper Executive Summary -----------------------
    try:
        if section_summary_texts:
            exec_context = "\n\n".join(section_summary_texts[:6])
            exec_summary = generate_summary(
                content=exec_context,
                section_header="Executive Summary",
                paper_title=paper_title,
            )
        else:
            fallback_text = "\n\n".join(c.content for c in raw_chunks[:4])
            exec_summary = generate_summary(
                content=fallback_text,
                section_header="Executive Summary",
                paper_title=paper_title,
            )
    except Exception:
        fallback_text = "\n\n".join(c.content for c in raw_chunks[:4])
        exec_summary = _extractive_fallback_summary(fallback_text, "Executive Summary", paper_title)

    exec_node = HierarchicalNode(
        node_id=f"{paper_id}_paper_summary",
        paper_id=paper_id,
        paper_title=paper_title,
        section_header="Full Paper Executive Summary",
        page_number=1,
        chunk_index=len(summary_nodes),
        node_level="summary",
        has_table=False,
        has_equation=False,
        content=exec_summary,
    )
    summary_nodes.append(exec_node)

    return leaf_nodes + summary_nodes
