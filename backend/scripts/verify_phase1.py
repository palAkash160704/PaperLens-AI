#!/usr/bin/env python
"""
Phase 1 end-to-end verification script.

Ingests arXiv paper 1706.03762 ("Attention Is All You Need"),
runs the full Docling → semantic-chunking pipeline, and asserts:
    1. Markdown file exists and is non-empty.
    2. Chunks JSON has > 10 chunks.
    3. At least one chunk has a table with pipe syntax (|---|).
    4. At least one chunk has an equation.
    5. Known section headers are captured accurately.

Prints a summary table of the first 5 chunks.
"""

import json
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Ensure the backend package is importable
# ---------------------------------------------------------------------------
_BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_DIR))

from app.core.config import PROCESSED_DATA_DIR          # noqa: E402
from app.services.arxiv_service import fetch_arxiv_paper # noqa: E402
from app.services.parser_service import parse_pdf        # noqa: E402
from app.services.chunker_service import chunk_document, save_chunks  # noqa: E402


def _hr(char: str = "=", width: int = 72) -> str:
    return char * width


def main() -> None:
    paper_id = "1706.03762"

    print(_hr())
    print(f"  Phase 1 Verification — Ingesting arXiv {paper_id}")
    print(_hr())
    print()

    # ------------------------------------------------------------------
    # Step 1: Fetch from arXiv
    # ------------------------------------------------------------------
    print("[1/3] Fetching paper from arXiv …")
    metadata, pdf_path = fetch_arxiv_paper(paper_id)
    print(f"      Title   : {metadata.title}")
    print(f"      Authors : {', '.join(metadata.authors[:3])} …")
    print(f"      PDF     : {pdf_path}")
    print()

    # ------------------------------------------------------------------
    # Step 2: Parse with Docling
    # ------------------------------------------------------------------
    print("[2/3] Parsing PDF with IBM Docling (may take several minutes on first run) …")
    markdown, elements = parse_pdf(pdf_path, paper_id)
    print(f"      Markdown length : {len(markdown):,} chars")
    print(f"      Elements found  : {len(elements)}")
    print()

    # ------------------------------------------------------------------
    # Step 3: Semantic chunking
    # ------------------------------------------------------------------
    print("[3/3] Running semantic chunker …")
    chunks = chunk_document(paper_id, metadata.title, elements, metadata)
    chunks_path = save_chunks(paper_id, metadata, chunks)
    print(f"      Total chunks : {len(chunks)}")
    print(f"      Saved to     : {chunks_path}")
    print()

    # ==================================================================
    # Assertions
    # ==================================================================
    print(_hr())
    print("  Running assertions")
    print(_hr())
    print()

    # 1. Markdown file
    md_path = PROCESSED_DATA_DIR / f"{paper_id}.md"
    assert md_path.exists() and md_path.stat().st_size > 0, \
        "FAIL: Markdown file is missing or empty."
    print("  ✓  Markdown file exists and is non-empty")

    # 2. Chunks JSON count
    assert chunks_path.exists(), "FAIL: Chunks JSON file missing."
    with open(chunks_path, encoding="utf-8") as fh:
        data = json.load(fh)
    n_chunks = len(data["chunks"])
    assert n_chunks > 10, f"FAIL: Expected > 10 chunks, got {n_chunks}"
    print(f"  ✓  Chunks JSON contains {n_chunks} chunks (> 10)")

    # 3. Table detection
    table_chunks = [c for c in chunks if c.has_table]
    assert len(table_chunks) > 0, "FAIL: No chunks with has_table == True."
    # Verify at least one has real pipe syntax
    pipe_found = any(
        "|---" in tc.content or "|–" in tc.content or "| ---" in tc.content
        for tc in table_chunks
    )
    # Also accept any pipe-row pattern like | xxx | yyy |
    if not pipe_found:
        import re
        pipe_found = any(
            re.search(r"\|.+\|.+\|", tc.content)
            for tc in table_chunks
        )
    assert pipe_found, "FAIL: Table chunk lacks Markdown pipe syntax."
    print(f"  ✓  {len(table_chunks)} chunk(s) with tables — pipe syntax verified")

    # 4. Equation detection
    eq_chunks = [c for c in chunks if c.has_equation]
    assert len(eq_chunks) > 0, "FAIL: No chunks with has_equation == True."
    print(f"  ✓  {len(eq_chunks)} chunk(s) with equations")

    # 5. Section headers
    headers = {c.section_header for c in chunks}
    print(f"  ✓  Distinct section headers: {len(headers)}")
    for h in sorted(headers):
        print(f"       • {h}")

    known_fragments = [
        "Model Architecture",
        "Attention",
        "Conclusion",
        "Introduction",
        "Training",
    ]
    matched = [
        kw for kw in known_fragments
        if any(kw.lower() in h.lower() for h in headers)
    ]
    assert len(matched) >= 2, (
        f"FAIL: Expected ≥ 2 known headers matched, got {matched}"
    )
    print(f"  ✓  Known header keywords matched: {matched}")

    # ==================================================================
    # Summary table of first 5 chunks
    # ==================================================================
    print()
    print(_hr())
    print("  First 5 chunks")
    print(_hr())
    print()

    hdr_fmt = f"  {'Idx':<5} {'Section Header':<40} {'Page':<6} {'Tbl':<5} {'Eq':<5} {'Chars':<7}"
    print(hdr_fmt)
    print(f"  {'-'*5} {'-'*40} {'-'*6} {'-'*5} {'-'*5} {'-'*7}")

    for c in chunks[:5]:
        sec = c.section_header
        if len(sec) > 38:
            sec = sec[:36] + " …"
        tbl = "Yes" if c.has_table else "No"
        eq = "Yes" if c.has_equation else "No"
        print(f"  {c.chunk_index:<5} {sec:<40} {c.page_number:<6} {tbl:<5} {eq:<5} {len(c.content):<7}")

    print()
    print(_hr())
    print("  ALL ASSERTIONS PASSED ✓")
    print(_hr())


if __name__ == "__main__":
    main()
