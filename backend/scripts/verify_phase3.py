#!/usr/bin/env python
"""
Phase 3 end-to-end verification script.

Validates:
1. Ingestion & indexing of both 1706.03762 (Transformer) and 2005.11401 (RAG).
2. Grounded Q&A with inline citations [1], [2] and exact metric extraction (28.4 BLEU).
3. Anti-hallucination dual-layer refusal for an out-of-scope trap query (iPhone battery).
4. Automated 5-part structured paper briefing with disk JSON caching.
5. Multi-paper side-by-side comparative matrix engine with cross-paper synthesis.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Ensure the backend package is importable
_BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_DIR))

from app.core.config import PROCESSED_DATA_DIR                     # noqa: E402
from app.models.schemas import QARequest                           # noqa: E402
from app.services.arxiv_service import fetch_arxiv_paper           # noqa: E402
from app.services.brief_service import generate_paper_brief        # noqa: E402
from app.services.chunker_service import chunk_document, save_chunks # noqa: E402
from app.services.matrix_service import compare_papers             # noqa: E402
from app.services.parser_service import parse_pdf                  # noqa: E402
from app.services.qa_service import answer_question                # noqa: E402
from app.services.raptor_service import build_hierarchical_nodes    # noqa: E402
from app.services.vector_store_service import index_nodes          # noqa: E402


def _hr(char: str = "=", width: int = 80) -> str:
    return char * width


def ensure_paper_ready(paper_id: str) -> None:
    """Ensure a paper is fully ingested and indexed in Qdrant."""
    chunks_path = PROCESSED_DATA_DIR / f"{paper_id}_chunks.json"

    if not chunks_path.exists():
        print(f"      • Ingesting paper {paper_id} from arXiv via Docling...")
        metadata, pdf_path = fetch_arxiv_paper(paper_id)
        _md, elements = parse_pdf(pdf_path, paper_id)
        chunks = chunk_document(paper_id, metadata.title, elements, metadata)
        save_chunks(paper_id, metadata, chunks)
        print(f"        ✓ Saved {len(chunks)} chunks to {chunks_path}")
    else:
        print(f"      • ✓ Phase 1 chunks found for {paper_id}")

    # Build and index hierarchical nodes into local Qdrant
    nodes = build_hierarchical_nodes(paper_id)
    indexed = index_nodes(nodes)
    print(f"      • ✓ Indexed {indexed} hierarchical nodes for {paper_id} into Qdrant.")


def main() -> None:
    print(_hr())
    print("  Phase 3 Verification — Grounded QA, Briefing & Comparative Matrix")
    print(_hr())
    print()

    # ------------------------------------------------------------------
    # Step 1: Ensure both landmark papers are ingested and indexed
    # ------------------------------------------------------------------
    print("[1/5] Ensuring landmark research papers are ingested and indexed...")
    paper_1 = "1706.03762"  # Attention Is All You Need
    paper_2 = "2005.11401"  # Retrieval-Augmented Generation (RAG)

    ensure_paper_ready(paper_1)
    ensure_paper_ready(paper_2)
    print("      ✓ Both papers ready in Qdrant vector store.\n")

    # ------------------------------------------------------------------
    # Step 2: Test Grounded Q&A with Citation Enforcement
    # ------------------------------------------------------------------
    print("[2/5] Testing Grounded Q&A with citation enforcement...")
    qa_query = (
        "How does Multi-Head Attention work and what BLEU score did the big "
        "Transformer achieve on WMT 2014 English-to-German?"
    )
    print(f"      Query: '{qa_query}'")

    qa_resp = answer_question(
        QARequest(query=qa_query, paper_ids=[paper_1], top_k=5)
    )

    print("\n      --- Grounded Answer ---")
    print(f"      {qa_resp.answer}")
    print(f"      Grounded: {qa_resp.is_grounded} | Citations Count: {len(qa_resp.citations)}")
    for c in qa_resp.citations:
        print(f"        • [{c.citation_index}] '{c.paper_title}', {c.section_header} (p. {c.page_number})")

    assert qa_resp.is_grounded, "FAIL: Grounded Q&A response flagged as ungrounded."
    assert len(qa_resp.citations) >= 1, "FAIL: Grounded Q&A returned no citations."
    assert "28.4" in qa_resp.answer, "FAIL: Grounded answer did not extract '28.4' BLEU score."
    print("      ✓ Assertion passed: Grounded Q&A succeeded with citations and '28.4' BLEU score.\n")

    # ------------------------------------------------------------------
    # Step 3: Test Anti-Hallucination Refusal Guardrail
    # ------------------------------------------------------------------
    print("[3/5] Testing Anti-Hallucination Refusal Guardrail (Out-of-Scope Trap Query)...")
    trap_query = "What is the exact battery capacity of the iPhone 16 Pro Max?"
    print(f"      Trap Query: '{trap_query}'")

    trap_resp = answer_question(
        QARequest(query=trap_query, paper_ids=[paper_1, paper_2], top_k=5)
    )

    print(f"      Answer: '{trap_resp.answer}'")
    print(f"      Grounded: {trap_resp.is_grounded} | Refusal Reason: {trap_resp.refusal_reason}")

    assert not trap_resp.is_grounded, "FAIL: Trap query was incorrectly flagged as grounded!"
    assert any(
        phrase in trap_resp.answer.lower()
        for phrase in ("do not contain", "insufficient", "not enough", "cannot answer")
    ), f"FAIL: Expected refusal phrasing in answer, got: '{trap_resp.answer}'"
    assert len(trap_resp.citations) == 0, "FAIL: Refused query should return 0 citations."
    print("      ✓ Assertion passed: Out-of-scope trap query was properly refused without hallucination.\n")

    # ------------------------------------------------------------------
    # Step 4: Test 5-Part Structured Paper Briefing
    # ------------------------------------------------------------------
    print(f"[4/5] Testing 5-Part Structured Paper Briefing for {paper_1}...")
    brief = generate_paper_brief(paper_1, force_refresh=True)

    cache_file = PROCESSED_DATA_DIR / f"{paper_1}_brief.json"
    assert cache_file.exists(), f"FAIL: Briefing JSON file missing at {cache_file}"

    # Verify all 5 briefing fields are present and non-empty
    assert brief.core_problem and len(brief.core_problem) > 20, "FAIL: core_problem missing or empty."
    assert brief.proposed_architecture and len(brief.proposed_architecture) > 20, "FAIL: proposed_architecture missing or empty."
    assert brief.datasets_and_benchmarks and len(brief.datasets_and_benchmarks) > 10, "FAIL: datasets_and_benchmarks missing."
    assert brief.key_results and len(brief.key_results) > 10, "FAIL: key_results missing."
    assert brief.stated_limitations and len(brief.stated_limitations) > 10, "FAIL: stated_limitations missing."

    print("      ✓ All 5 briefing sections verified:")
    print(f"        1. Core Problem: {brief.core_problem[:120]}...")
    print(f"        2. Architecture: {brief.proposed_architecture[:120]}...")
    print(f"        3. Datasets    : {brief.datasets_and_benchmarks[:120]}...")
    print(f"        4. Key Results : {brief.key_results[:120]}...")
    print(f"        5. Limitations : {brief.stated_limitations[:120]}...")
    print(f"        • Citations Attached: {len(brief.citations)}")
    print("      ✓ Assertion passed: 5-part briefing generated and verified on disk.\n")

    # ------------------------------------------------------------------
    # Step 5: Test Multi-Paper Comparative Matrix Engine
    # ------------------------------------------------------------------
    print(f"[5/5] Testing Multi-Paper Comparative Matrix Engine ({paper_1} vs {paper_2})...")
    custom_dims = ["Primary Training Objective"]
    matrix_resp = compare_papers([paper_1, paper_2], custom_dimensions=custom_dims)

    assert matrix_resp.papers_compared == 2, f"FAIL: Expected 2 papers compared, got {matrix_resp.papers_compared}"
    assert len(matrix_resp.rows) == 2, f"FAIL: Expected 2 rows, got {len(matrix_resp.rows)}"
    assert matrix_resp.synthesis_takeaway, "FAIL: synthesis_takeaway is empty."

    # Print Clean ASCII Comparison Table
    print("\n" + _hr("-"))
    print(f"{'Dimension':<25} | {'1706.03762 (Transformer)':<30} | {'2005.11401 (RAG)':<30}")
    print(_hr("-"))

    r1, r2 = matrix_resp.rows[0], matrix_resp.rows[1]
    dims = [
        ("Problem", r1.problem_addressed, r2.problem_addressed),
        ("Architecture", r1.model_architecture, r2.model_architecture),
        ("Datasets", r1.datasets_used, r2.datasets_used),
        ("Key Metrics", r1.key_metrics, r2.key_metrics),
        ("Limitations", r1.limitations, r2.limitations),
    ]

    for dim_name, v1, v2 in dims:
        s1 = v1.replace("\n", " ")[:28] + ".."
        s2 = v2.replace("\n", " ")[:28] + ".."
        print(f"{dim_name:<25} | {s1:<30} | {s2:<30}")

    for cd in custom_dims:
        cv1 = r1.custom_fields.get(cd, "")[:28] + ".."
        cv2 = r2.custom_fields.get(cd, "")[:28] + ".."
        print(f"{cd:<25} | {cv1:<30} | {cv2:<30}")

    print(_hr("-"))
    print("\n--- Cross-Paper Synthesis Takeaway ---")
    print(matrix_resp.synthesis_takeaway)
    print()

    print(_hr())
    print("  ALL PHASE 3 ASSERTIONS PASSED ✓")
    print(_hr())


if __name__ == "__main__":
    main()
