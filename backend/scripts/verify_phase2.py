#!/usr/bin/env python
"""
Phase 2 end-to-end verification script.

1. Verifies backend/data/processed/1706.03762_chunks.json exists.
2. Indexes paper 1706.03762 into Qdrant (asserts leaf_nodes > 10 and summary_nodes >= 3).
3. Executes Query 1 (Broad synthesis):
   "Summarize the overall Transformer model architecture and its main contributions"
   Asserts at least one top-3 result has node_level == "summary".
4. Executes Query 2 (Specific factual):
   "What BLEU score did the big Transformer model achieve on English-to-German WMT 2014?"
   Asserts at least one top-3 result has node_level == "leaf" and contains "28.4".
5. Prints formatted ASCII summary tables of the top 3 results for both queries.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure the backend package is importable
_BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_DIR))

from app.core.config import PROCESSED_DATA_DIR, RAW_DATA_DIR  # noqa: E402
from app.services.arxiv_service import fetch_arxiv_paper        # noqa: E402
from app.services.chunker_service import chunk_document, save_chunks  # noqa: E402
from app.services.parser_service import parse_pdf               # noqa: E402
from app.services.raptor_service import build_hierarchical_nodes # noqa: E402
from app.services.retriever_service import search_and_rerank     # noqa: E402
from app.services.vector_store_service import index_nodes       # noqa: E402


def _hr(char: str = "=", width: int = 78) -> str:
    return char * width


def _print_results_table(title: str, results: list) -> None:
    print(f"\n{title}")
    print("-" * len(title))
    header = f"{'Rank':<5} {'Level':<9} {'Section Header':<30} {'Page':<5} {'Score':<8} {'Snippet'}"
    print(header)
    print("-" * 78)
    for idx, r in enumerate(results, start=1):
        sec = r.section_header
        if len(sec) > 28:
            sec = sec[:26] + ".."
        snippet = r.content.replace("\n", " ").strip()
        if len(snippet) > 40:
            snippet = snippet[:38] + ".."
        print(f"{idx:<5} {r.node_level:<9} {sec:<30} {r.page_number:<5} {r.rerank_score:<8.4f} {snippet}")
    print()


def main() -> None:
    paper_id = "1706.03762"

    print(_hr())
    print("  Phase 2 Verification — Hierarchical Indexing & Hybrid Retrieval")
    print(_hr())
    print()

    # ------------------------------------------------------------------
    # Step 1: Ensure Phase 1 chunks exist
    # ------------------------------------------------------------------
    chunks_path = PROCESSED_DATA_DIR / f"{paper_id}_chunks.json"
    if not chunks_path.exists():
        print(f"[1/3] Phase 1 chunks missing for {paper_id}. Running Phase 1 ingestion...")
        metadata, pdf_path = fetch_arxiv_paper(paper_id)
        _md, elements = parse_pdf(pdf_path, paper_id)
        chunks = chunk_document(paper_id, metadata.title, elements, metadata)
        save_chunks(paper_id, metadata, chunks)
        print("      Phase 1 ingestion completed.")
    else:
        print(f"[1/3] ✓ Found Phase 1 processed chunks at {chunks_path}")

    # ------------------------------------------------------------------
    # Step 2: Build RAPTOR Hierarchical Nodes & Index into Qdrant
    # ------------------------------------------------------------------
    print("\n[2/3] Building RAPTOR hierarchical nodes (leaf + summaries)...")
    nodes = build_hierarchical_nodes(paper_id)
    leaf_nodes = [n for n in nodes if n.node_level == "leaf"]
    summary_nodes = [n for n in nodes if n.node_level == "summary"]

    print(f"      Total nodes created    : {len(nodes)}")
    print(f"      - Leaf nodes (Level 0) : {len(leaf_nodes)}")
    print(f"      - Summary nodes (Level 1): {len(summary_nodes)}")

    assert len(leaf_nodes) > 10, f"FAIL: Expected > 10 leaf nodes, got {len(leaf_nodes)}"
    assert len(summary_nodes) >= 3, f"FAIL: Expected >= 3 summary nodes, got {len(summary_nodes)}"
    print("      ✓ Assertion passed: leaf_nodes > 10 and summary_nodes >= 3")

    print("      Indexing nodes into local Qdrant (Dense BGE + Sparse BM25)...")
    total_indexed = index_nodes(nodes)
    print(f"      ✓ Successfully indexed {total_indexed} points into Qdrant collection.")

    # ------------------------------------------------------------------
    # Step 3: Run Retrieval Tests
    # ------------------------------------------------------------------
    print("\n[3/3] Executing two-stage hybrid retrieval & reranking tests...")

    # Test 1: Broad Synthesis Query
    query_1 = "Summarize the overall Transformer model architecture and its main contributions"
    print(f"\n>> Test Query 1: '{query_1}'")
    results_1 = search_and_rerank(
        query=query_1,
        paper_ids=[paper_id],
        top_k=3,
        node_level="auto",
    )
    _print_results_table("Top 3 Results for Query 1 (Broad Synthesis):", results_1)

    has_summary = any(r.node_level == "summary" for r in results_1)
    assert has_summary, (
        f"FAIL Query 1: Expected at least one result with node_level == 'summary', "
        f"got levels: {[r.node_level for r in results_1]}"
    )
    print("✓ Assertion passed: Query 1 returned at least one summary node.")

    # Test 2: Specific Factual / Metric Query
    query_2 = "What BLEU score did the big Transformer model achieve on English-to-German WMT 2014?"
    print(f"\n>> Test Query 2: '{query_2}'")
    results_2 = search_and_rerank(
        query=query_2,
        paper_ids=[paper_id],
        top_k=3,
        node_level="auto",
    )
    _print_results_table("Top 3 Results for Query 2 (Specific Factual / Table):", results_2)

    has_leaf_28_4 = any(
        r.node_level == "leaf" and "28.4" in r.content
        for r in results_2
    )
    assert has_leaf_28_4, (
        f"FAIL Query 2: Expected at least one leaf node containing '28.4', "
        f"got: {[(r.node_level, '28.4' in r.content) for r in results_2]}"
    )
    print("✓ Assertion passed: Query 2 returned a leaf node containing '28.4' BLEU score.")

    print()
    print(_hr())
    print("  ALL PHASE 2 ASSERTIONS PASSED ✓")
    print(_hr())


if __name__ == "__main__":
    main()
