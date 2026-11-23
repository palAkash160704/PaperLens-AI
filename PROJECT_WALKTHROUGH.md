# 🔬 PaperLens AI — Complete Technical Working & Explainer Guide

> **A Comprehensive, Step-by-Step Architecture & Presentation Reference**  
> *Author: Research & AI Engineering Team*  
> *Project: PaperLens AI — Research Paper Summarization, Grounded QA, & Hierarchical Retrieval System*

---

## 📌 Table of Contents
1. [Executive Overview & Problem Statement](#1-executive-overview--problem-statement)
2. [End-to-End System Architecture](#2-end-to-end-system-architecture)
3. [Phase-by-Phase Technical Deep Dive](#3-phase-by-phase-technical-deep-dive)
   - [Phase 1: Ingestion & Sub-Second Parsing Engine](#phase-1-ingestion--sub-second-parsing-engine)
   - [Phase 1b: Structure-Aware Semantic Chunking](#phase-1b-structure-aware-semantic-chunking)
   - [Phase 2: RAPTOR-Lite Hierarchical Indexing & Qdrant](#phase-2-raptor-lite-hierarchical-indexing--qdrant)
   - [Phase 2b: Dense + Sparse Hybrid Search & Cross-Encoder Reranking](#phase-2b-dense--sparse-hybrid-search--cross-encoder-reranking)
   - [Phase 3: Grounded Q&A, Citation Enforcement & Refusal Guardrails](#phase-3-grounded-qa-citation-enforcement--refusal-guardrails)
   - [Phase 3b: Automated Paper Briefs & Multi-Paper Comparison Matrices](#phase-3b-automated-paper-briefs--multi-paper-comparison-matrices)
   - [Phase 4: Obsidian & Daylight Research Studio UI](#phase-4-obsidian--daylight-research-studio-ui)
   - [Phase 5: Empirical Quantitative Evaluation & Baseline Comparison](#phase-5-empirical-quantitative-evaluation--baseline-comparison)
4. [Key Architectural Innovations (Why Standard RAG Fails)](#4-key-architectural-innovations-why-standard-rag-fails)
5. [Viva & Examiner Q&A Cheat Sheet (Top 10 Technical Questions)](#5-viva--examiner-qa-cheat-sheet-top-10-technical-questions)
6. [Live 3-Minute Demo Script for Presentations](#6-live-3-minute-demo-script-for-presentations)
7. [Repository File & Directory Roadmap](#7-repository-file--directory-roadmap)

---

## 1. Executive Overview & Problem Statement

### The Problem with Existing AI & Naive RAG on Research Papers
Academic research papers are the most demanding document format for Large Language Models (LLMs) and standard vector search systems:
1. **Layout & Typesetting Complexity:** Multi-column layouts, tables with numeric benchmark scores, inline/display mathematical formulas ($$\text{Softmax}(\frac{QK^T}{\sqrt{d_k}})V$$), and PDF artifacts. Naive PDF parsers mangle two-column text into garbled interleavings.
2. **The "Lost in the Middle" Problem:** Feeding a 30-page PDF directly to long-context LLMs results in severe attention degradation—the model misses specific numbers buried in Table 4 or Table 5.
3. **The Micro vs. Macro Dilemma:**
   - **Naive Flat RAG** chops text into fixed 500-character blocks. It can find narrow facts ("What is the learning rate?"), but completely fails at macro-synthesis questions ("Summarize the main contributions and compare against RNNs").
   - It also chops mathematical formulas and markdown tables in half.
4. **Hallucination & Lack of Verifiable Provenance:** Academic research requires absolute truthfulness. If an LLM states a model achieved `28.4 BLEU`, a researcher must know **exact page numbers, section headers, and ground-truth text spans**.

### The Solution: PaperLens AI
**PaperLens AI** is a production-grade, full-stack research workspace combining:
- **Fast & Precision Parsing:** Sub-second PDF text extraction (`pypdfium2` / `pymupdf4llm`) with layout-aware IBM Docling fallback.
- **Structure-Aware Chunking:** Respects section boundaries; never splits tables or formulas.
- **RAPTOR-Lite Hierarchical Indexing:** Constructs Level 0 (fine-grained leaf chunks) + Level 1 (section and paper executive summaries).
- **Hybrid Dense + Sparse Search (FastEmbed ONNX + BM25) with Reciprocal Rank Fusion (RRF)**.
- **BGE Cross-Encoder Reranking** for joint token-level query-passage attention.
- **Citation-Enforced Grounded Q&A:** Emits strict `[1][2]` badges mapped to exact page coordinates, with out-of-scope refusal guardrails.
- **Studio-Grade UI:** Obsidian dark/daylight theme, resizable split-screen reader, original PDF toggle, highlight-to-ask popover, and live evaluation charts.

---

## 2. End-to-End System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PAPERLENS AI PIPELINE                                │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [ arXiv ID / URL ] OR [ Local PDF Upload ]
           │
           ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. INGESTION & PARSING ENGINE                               │
  │    - Fast Engine: Google PDFium / PyMuPDF (0.16s)           │
  │    - Precision Engine: IBM Docling Layout Parser            │
  │    - Normalization: Spaced small-caps, formulas & tables    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. STRUCTURE-AWARE SEMANTIC CHUNKING                        │
  │    - Splits strictly along section boundaries               │
  │    - Zero formula/table truncation (MAX 4500 chars)         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. RAPTOR-LITE HIERARCHICAL INDEXING                        │
  │    - Level 0: Fine-grained leaf chunks (Micro details)      │
  │    - Level 1: Section & Executive summaries (Macro context) │
  │    - Rate-limit aware parallelization (ThreadPoolExecutor)  │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. EMBEDDING & PERSISTENT VECTOR STORE                      │
  │    - Dense Embeddings: BAAI/bge-small-en-v1.5 (FastEmbed)   │
  │    - Sparse Vectors: BM25 Lexical Term Frequencies          │
  │    - Storage: Local Embedded Qdrant Engine                  │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                 User Query ─────┤
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. HYBRID RETRIEVAL & CROSS-ENCODER RERANKING               │
  │    - Step A: Hybrid Dense + BM25 Candidate Retrieval        │
  │    - Step B: Reciprocal Rank Fusion (RRF, k=60)             │
  │    - Step C: Cross-Encoder Reranker (BAAI/bge-reranker-base)│
  │    - Output: Top-K context chunks with exact provenance     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. CITATION-ENFORCED GROUNDED GENERATION (LLM)              │
  │    - Supported Providers: Groq (Qwen/Llama) & Google Gemini │
  │    - Grounding Prompt: Strict rule: ground ONLY on sources  │
  │    - Citation Format: Interceptable badges [1], [2]         │
  │    - Refusal Guardrails: Refuses out-of-scope traps cleanly │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 7. REACT 19 RESEARCH STUDIO WORKSPACE                       │
  │    - Obsidian & Daylight Theme System                       │
  │    - Dual View: Smart Markdown Reader & Original PDF View   │
  │    - Draggable split-screen layout                          │
  │    - "Highlight-to-Ask" selection popup                     │
  │    - Executive Briefings & Multi-Paper Comparison Matrix   │
  │    - Empirical Ablation Benchmark Visualization             │
  └─────────────────────────────────────────────────────────────┘
```

---

## 3. Phase-by-Phase Technical Deep Dive

### Phase 1: Ingestion & Sub-Second Parsing Engine
*Core Files: `backend/app/services/parser_service.py`, `arxiv_service.py`, `ingest.py`*

#### Working Mechanism:
1. **arXiv Automated Fetcher:** Given an arXiv ID (e.g., `1706.03762`) or URL, `arxiv_service.py` queries the arXiv API, extracts paper metadata (title, authors, publication date, abstract), and downloads the raw PDF to `backend/data/raw/{paper_id}.pdf`.
2. **Local PDF Upload:** Accepts any research paper PDF via multipart upload, sanitizes the filename, generates a unique ID, and saves it.
3. **Dual Parsing Modes:**
   - **⚡ Fast Mode (Default ~0.16s):** Uses `pypdfium2` (Google Chrome's native PDFium C++ engine) and `pymupdf4llm`. Reads text directly from digital PDF streams, identifies numbered sections (`1 Introduction`, `3.2 Attention`), extracts display math, and tags each paragraph with exact 1-indexed `page_number` metadata in under 200 milliseconds.
   - **🔬 Precision Mode (~15s):** Uses IBM Docling (`DocumentConverter`) configured with `do_ocr=False` and `do_table_structure=True` for complex, distorted multi-table scans.
4. **PDF Typesetting Normalization:**
   - PDF fonts frequently introduce spaced small-caps artifacts (e.g., `a b s t r a c t`, `a r t i c l e i n f o`). A regex normalizer detects letter spacing `(?:[A-Za-z]\s+){3,}` and cleans them into readable words.
   - Dynamic Academic Title Extraction: Inspects early text blocks on page 1, ignores publisher clutter ("Contents lists available at Elsevier"), and automatically sets the actual paper title.

---

### Phase 1b: Structure-Aware Semantic Chunking
*Core Files: `backend/app/services/chunker_service.py`*

#### Why Naive Chunking Fails:
Standard RAG uses fixed character windows (e.g., 500 characters with 50-character overlap). This arbitrarily splits sentences in half, severs LaTeX math equations ($$\dots \frac{1}{\sqrt{d_k}}$$ split into two chunks), and destroys markdown table rows.

#### Our Semantic Algorithm:
1. **Section Grouping:** Groups parsed elements by section header (`"3.2 Attention"`, `"4 Experiments"`). Elements before the first header are tagged `"Abstract / Preamble"`.
2. **Atomic Block Preservation:** Tables (`label="table"`) and mathematical formulas (`label="formula"`) are treated as atomic units and are **never split**.
3. **Token-Aware Boundary Splitting:** Sections are accumulated up to `MAX_CHUNK_CHARS = 4500` (~1,200 tokens). If a section exceeds the budget, it splits cleanly on sentence or paragraph boundaries, preserving semantic integrity.
4. **Metadata Enrichment:** Every generated `DocumentChunk` carries:
   - `chunk_id`: e.g., `1706.03762_chunk_04`
   - `paper_id`, `paper_title`, `section_header`
   - `page_number` (source PDF page)
   - `has_table` (bool), `has_equation` (bool)
   - `content` (Markdown text)

---

### Phase 2: RAPTOR-Lite Hierarchical Indexing & Qdrant
*Core Files: `backend/app/services/raptor_service.py`, `vector_store_service.py`*

#### The RAPTOR Concept (Recursive Abstractive Processing for Tree-Organized Retrieval):
Traditional RAG only indexes leaf chunks. When a user asks a high-level question ("How does this approach compare to prior work?"), traditional RAG retrieves 5 disconnected paragraphs, missing the overarching thesis.

PaperLens AI constructs a 2-level hierarchical tree:
- **Level 0 (Leaf Nodes):** The raw semantic chunks generated in Phase 1b. Best for micro-lookups (exact BLEU scores, formula scaling factors).
- **Level 1 (Summary Nodes):**
  - **Section Summaries:** Technical 3–5 sentence summaries of major sections (Abstract, Introduction, Architecture, Results).
  - **Global Executive Summary:** A holistic synthesis of the entire paper.
  - Best for broad conceptual questions, comparative analysis, and high-level summaries.

```
                  ┌─────────────────────────────────────────┐
                  │    Level 1: Paper Executive Summary     │
                  └────────────────────┬────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│ Section Summary: │          │ Section Summary: │          │ Section Summary: │
│ 1. Introduction  │          │ 3. Architecture  │          │ 5. Results       │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                             │
    ┌────┴────┐                   ┌────┴────┐                   ┌────┴────┐
    ▼         ▼                   ▼         ▼                   ▼         ▼
[Leaf 01]  [Leaf 02]          [Leaf 03]  [Leaf 04]          [Leaf 05]  [Leaf 06]
```

#### Rate-Limit-Aware Parallel Execution:
Groq's high-speed tier enforces token rate limits (e.g., 1,000 output tokens/minute). Rather than making 25 sequential or unbounded concurrent LLM calls:
- Top major sections are prioritized for concurrent LLM summarization via `ThreadPoolExecutor(max_workers=3)`.
- Remaining minor sections receive instant, deterministic extractive summaries.
- If a rate limit (429) occurs, the system falls back seamlessly to deterministic extractive summaries without crashing.
- **Tree construction finishes in ~2.8 seconds!**

#### Persistent Vector Database (Qdrant):
All nodes are stored in a local, embedded Qdrant collection (`paperlens_hierarchical_nodes`):
- Persistent storage in `backend/data/qdrant_db/` (no Docker required).
- Fast in-memory indexing with payload filtering on `paper_id` and `node_level`.

---

### Phase 2b: Dense + Sparse Hybrid Search & Cross-Encoder Reranking
*Core Files: `backend/app/services/retriever_service.py`*

Retrieval combines three complementary techniques to achieve state-of-the-art precision:

```
 User Query: "What scaling factor is used in dot-product attention and why?"
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
 [ Dense Semantic Search ]                    [ Sparse Lexical Search ]
 Model: BAAI/bge-small-en-v1.5                Model: BM25 Term Frequency
 Vector: 384-dimensional ONNX                 Catches exact symbols: "1/sqrt(d_k)",
 Catches: "scaling factor", "variance"        "dot-product attention", "d_k"
        │                                               │
        └───────────────────────┬───────────────────────┘
                                ▼
              [ Reciprocal Rank Fusion (RRF, k=60) ]
              Score = 1/(60 + Rank_Dense) + 1/(60 + Rank_BM25)
                                │
                                ▼ Top 20 Candidates
              [ BGE Cross-Encoder Reranker ]
              Model: BAAI/bge-reranker-base
              Joint Attention: [CLS] Query [SEP] Chunk Text [SEP]
              Outputs real-valued relevance logits (-10.0 to +10.0)
                                │
                                ▼
                     Final Top-K Chunks
```

1. **Why Dense alone fails:** Dense embeddings can miss exact acronyms, benchmark numbers (e.g. `28.4`), and mathematical notation ($d_k$).
2. **Why BM25 alone fails:** BM25 cannot understand semantic synonyms (e.g. matching "Transformer benefits over RNNs" with "reduced sequential computation").
3. **Reciprocal Rank Fusion (RRF):** Merges dense and sparse rankings mathematically without needing score calibration:
   $$RRF\_Score(d) = \sum_{m \in \{\text{dense}, \text{sparse}\}} \frac{1}{60 + \text{rank}_m(d)}$$
4. **Cross-Encoder Reranking:** Bi-encoders (vector search) compare pre-computed representations. The Cross-Encoder feeds the query and candidate chunk *together* through BERT's full self-attention layers, computing joint token interactions and discarding irrelevant matches.

---

### Phase 3: Grounded Q&A, Citation Enforcement & Refusal Guardrails
*Core Files: `backend/app/services/qa_service.py`*

#### The Grounding System Prompt:
```text
You are an expert AI research assistant analyzing academic papers.
Answer the user's question using ONLY the provided context excerpts.

CRITICAL CITATION RULES:
1. Every factual statement must cite its source using adjacent single brackets like [1][2].
2. The index corresponds strictly to the 1-based index in the Context list.
3. If the context does not contain enough evidence to answer, YOU MUST EXPLICITLY REFUSE to answer.
   Set is_grounded = false and explain what information is missing.
4. NEVER hallucinate or extrapolate beyond the cited text.
```

#### Citation Mapping (`CitationSource`):
Whenever the LLM outputs `[1]` or `[2]`:
- The backend matches `[k]` to the exact $k$-th retrieved context chunk.
- It attaches:
  - `citation_index`: e.g. `1`
  - `chunk_id`: `1706.03762_chunk_04`
  - `paper_id` & `paper_title`
  - `section_header`: `"3.2.1 Scaled Dot-Product Attention"`
  - `page_number`: `Page 4`
  - `snippet`: The exact 250-character source excerpt.
- When clicked in the UI, the frontend displays this provenance metadata instantly.

#### Out-of-Scope Trap Refusal Guardrail:
If a user asks an unanswerable or misleading trap question:
- *Example:* "What was the BLEU score on the Chinese-to-English translation task in Table 2?" (The paper only evaluated English-German and English-French).
- Standard ChatGPT hallucinates a plausible number like "31.2".
- PaperLens AI's guardrail intercepts this, sets `is_grounded: false`, and outputs:
  > *"The provided paper evaluates the Transformer only on English-to-German and English-to-French translation tasks. It contains no results or benchmark scores for Chinese-to-English."*

---

### Phase 3b: Automated Paper Briefs & Multi-Paper Comparison Matrices
*Core Files: `backend/app/services/brief_service.py`, `matrix_service.py`*

1. **Executive Paper Briefs (`GET /api/v1/papers/{paper_id}/brief`):**
   - Automatically generates a structured executive brief cached to disk (`{paper_id}_brief.json`):
     - **Core Problem & Motivation**
     - **Key Contributions & Innovations**
     - **Methodology & Architecture Overview**
     - **Primary Results & Quantitative Benchmarks**
     - **Limitations & Future Work**
     - **Recommended Citations & Key Takeaways**
2. **Multi-Paper Comparative Matrix (`POST /api/v1/qa/matrix`):**
   - Enables simultaneous side-by-side comparison of 2 to 5 research papers across dimensions:
     - *Architecture / Method*
     - *Primary Tasks & Datasets*
     - *Key Results & Scores*
     - *Strengths & Disadvantages*
   - Returns a structured matrix rendered in the UI with Markdown and comparison tables.

---

### Phase 4: Obsidian & Daylight Research Studio UI
*Core Files: `frontend/src/` (`App.tsx`, `HeaderBar.tsx`, `PaperReaderPane.tsx`, `QATab.tsx`, `BriefTab.tsx`, `MatrixTab.tsx`, `EvalTab.tsx`)*

A modern, studio-grade research workspace designed for serious researchers:
- **Obsidian Dark & Daylight Theme System:** Seamless toggle between a dark obsidian palette (`#0B0F19`) and a clean daylight theme, persisted in `localStorage`.
- **Draggable Split-Screen Layout:** Interactive divider allowing the researcher to adjust the width between the paper reader and the QA workspace.
- **Dual-Mode Reader Pane:**
  - **Smart Markdown View:** Rendered with KaTeX formulas, interactive section navigation pills ("JUMP TO"), and section micro-badges (`[Tab]`, `[Eq]`).
  - **Original PDF View:** Renders the actual source PDF inline via `iframe` from `/api/v1/ingest/papers/{paper_id}/pdf`.
- **"Highlight-to-Ask" Text Popover:** Selecting any sentence or formula in the paper reader displays a floating `"Ask PaperLens"` button that auto-populates the QA prompt with the selected text as context.
- **Interactive Citation Badges:** Footnote numbers `[1]`, `[2]` render as clickable badges with hover tooltips and sidebar inspectors showing exact page provenance.
- **Live 3-Stage RAG Stepper:** Real-time animated indicator showing:
  1. *Retrieving hybrid dense & BM25 chunks...*
  2. *Cross-encoder reranking & scoring candidates...*
  3. *Synthesizing citation-grounded response...*

---

### Phase 5: Empirical Quantitative Evaluation & Baseline Comparison
*Core Files: `backend/scripts/evaluate_phase5.py`, `backend/data/eval_dataset.json`, `backend/data/eval_results.json`*

To quantitatively prove that our architectural choices outperform naive RAG, we built an automated evaluation benchmark containing **15 standardized questions** across two foundational papers (`1706.03762` "Attention Is All You Need" and `2005.11401` "RAG") evaluated across 4 categories:
1. **Table/Metric Lookups (4 questions):** Exact BLEU scores, training FLOPs, and QA accuracy.
2. **Equation/Architecture Questions (4 questions):** Scaled dot-product attention formulas, scaling factor $\frac{1}{\sqrt{d_k}}$, marginalization formulas.
3. **Broad Synthesis Questions (4 questions):** Comparing Transformer self-attention against RNNs/CNNs; comparing parametric vs. non-parametric memory.
4. **Unanswerable Trap Questions (3 questions):** Non-existent Chinese-to-English translation benchmarks, fictional hyperparameters.

#### Empirical Benchmark Results (System A vs System B):
Both systems evaluated using the **identical LLM** (`qwen/qwen3.8-27b` via Groq) to strictly isolate retrieval and chunking performance:

| Evaluation Metric | Naive Flat RAG Baseline | PaperLens AI (Our System) | Absolute Improvement |
| :--- | :---: | :---: | :---: |
| **Overall Accuracy** | 46.7% | **93.3%** | **+46.6%** |
| **Keyword / Fact Recall Rate** | 58.3% | **91.7%** | **+33.4%** |
| **Citation Validity Rate** | 0.0% | **100.0%** | **+100.0%** |
| **Trap Refusal Accuracy (Hallucination Defense)** | 0.0% | **100.0%** | **+100.0%** |
| **Broad Synthesis Accuracy** | 50.0% | **100.0%** | **+50.0%** |
| **Table / Metric Lookup Accuracy** | 25.0% | **75.0%** | **+50.0%** |

```
Quantitative Benchmark Comparison:
PaperLens AI:   ██████████████████████████████ 93.3%
Naive Baseline: ███████████████ 46.7%
                0%   20%   40%   60%   80%   100%
```

---

## 4. Key Architectural Innovations (Why Standard RAG Fails)

```
┌─────────────────────────────┬───────────────────────────────┬───────────────────────────────────┐
│ Feature                     │ Naive / Standard RAG Baseline │ PaperLens AI Approach             │
├─────────────────────────────┼───────────────────────────────┼───────────────────────────────────┤
│ Chunking Strategy           │ Fixed 500-char window         │ Semantic section-aware boundaries │
│ Formula & Table Handling    │ Chops math & tables in half   │ Atomic preservation (no splits)   │
│ Ingestion Speed             │ 40+ seconds (Docling OCR)     │ 0.16s (Sub-second PDFium engine)  │
│ Search Paradigm             │ Dense vector search only      │ Hybrid Dense + BM25 with RRF      │
│ Candidate Quality           │ Top-K vector distance         │ Cross-Encoder BERT Joint Attention│
│ Synthesis Capability        │ Fails on whole-paper queries  │ RAPTOR Level 1 Summary Nodes      │
│ Hallucination Defense       │ Hallucinates on traps (0%)    │ 100% Trap Refusal Guardrail       │
│ Provenance & Verification   │ Uncited or hallucinated pages │ Clickable page badges [1][2]      │
└─────────────────────────────┴───────────────────────────────┴───────────────────────────────────┘
```

---

## 5. Viva & Examiner Q&A Cheat Sheet (Top 10 Technical Questions)

#### Q1: "Why not just pass the entire PDF into a 1M-token context window like Gemini 1.5 Pro or Claude 3.5 Sonnet?"
> **Answer:** *"While modern LLMs have million-token context windows, relying solely on brute-force context windows has three fatal flaws:
> 1. **Lost in the Middle Degradation:** Research (Liu et al.) proves that recall on fine-grained metrics buried in tables (like BLEU score 28.4 in Table 2) drops significantly in long contexts.
> 2. **Latency and Cost:** Querying 50,000 tokens for every question costs 50x more and takes 8–15 seconds per turn. PaperLens retrieves the top ~1,500 relevant tokens, answering in 1–2 seconds.
> 3. **Verifiable Provenance:** A raw LLM response does not provide exact bounding boxes or deterministic page coordinates. Our pipeline links every claim to verified, retrievable chunk IDs."*

#### Q2: "Why do you use Hybrid Search (Dense + BM25) instead of just Dense Vector Search?"
> **Answer:** *"Dense embeddings (like BGE or Ada-002) encode general semantic meaning, but they struggle with exact lexical matches—such as numerical values (`28.4`), equation variables ($d_k$), or paper abbreviations (WMT, FLOPs). BM25 handles exact keyword token matches with zero semantic drift. By combining them with Reciprocal Rank Fusion (RRF), we get the best of both worlds: conceptual semantic understanding plus exact keyword precision."*

#### Q3: "What is the difference between a Bi-Encoder and a Cross-Encoder?"
> **Answer:** *"A Bi-Encoder (our FastEmbed model) encodes the query and the chunk separately into independent vectors, comparing them via cosine similarity. This is fast ($O(1)$ lookup in Qdrant) but loses fine-grained cross-token interactions.  
> A Cross-Encoder (BAAI/bge-reranker-base) feeds both query and passage simultaneously through BERT's self-attention mechanism ($[CLS]\text{Query}[SEP]\text{Passage}[SEP]$), allowing every word in the query to attend directly to every word in the document chunk. We use the Bi-Encoder for fast candidate retrieval (top 20) and the Cross-Encoder for high-precision reranking (top 5)."*

#### Q4: "What is RAPTOR and why is it needed in academic paper RAG?"
> **Answer:** *"RAPTOR stands for Recursive Abstractive Processing for Tree-Organized Retrieval. Traditional RAG only indexes leaf paragraphs. If a user asks a high-level question ('What is the overall architecture and main advantages of this model?'), leaf chunks are too fragmented. RAPTOR clusters chunks and generates abstractive summaries at Section and Paper levels. Our retriever can query leaf nodes for microscopic facts and summary nodes for macroscopic synthesis."*

#### Q5: "How does your system enforce citations and prevent hallucinations?"
> **Answer:** *"First, our prompt explicitly instructs the LLM that it is an evidence-bound assistant and must ground every claim using adjacent brackets `[1][2]`. Second, we implement strict refusal guardrails: if the retrieved context lacks sufficient evidence, the LLM must set `is_grounded: false` and state what is missing. In our Phase 5 evaluation, PaperLens achieved 100% citation validity and 100% trap refusal, whereas standard baseline RAG hallucinated on 100% of trap questions."*

#### Q6: "How did you optimize document ingestion from 40+ seconds down to 0.16 seconds?"
> **Answer:** *"Previously, the parser executed CPU-bound OCR and vision pipelines via Docling on all PDFs. We observed that 99% of research papers from arXiv are already digitally typesetting text. We implemented a fast parser using Google Chrome's PDFium engine (`pypdfium2`), which streams native font glyphs and coordinates in 0.16 seconds. We also parallelized RAPTOR section summarization and prioritized major sections to avoid Groq's 1,000 output tokens/minute rate limit."*

#### Q7: "What is Reciprocal Rank Fusion (RRF) and why use constant $k=60$?"
> **Answer:** *"Dense search produces cosine scores between 0 and 1, while BM25 produces unbounded scores (e.g., 14.5). Directly adding them requires delicate score normalization that breaks across varying query lengths. RRF uses rank positions rather than raw scores:
> $$\text{Score} = \frac{1}{60 + \text{Rank}_{\text{Dense}}} + \frac{1}{60 + \text{Rank}_{\text{BM25}}}$$
> The constant $k=60$ prevents top-ranked outliers from dominating the sum and is the standard established by Cormack et al."*

#### Q8: "What embeddings and vector database are you running?"
> **Answer:** *"We use `BAAI/bge-small-en-v1.5` running locally via FastEmbed ONNX runtime (384 dimensions) for dense vectors, combined with BM25 sparse vectors. For storage, we use an embedded, local instance of Qdrant (`qdrant-client`), which requires zero external Docker daemon and provides fast, persistent vector search on disk."*

#### Q9: "What LLMs does PaperLens AI support?"
> **Answer:** *"PaperLens AI features a unified LLM interface configured via `.env`:
> 1. **Groq (Default):** Runs `qwen/qwen3.8-27b` or `llama-3.3-70b-versatile` with sub-second generation speeds.
> 2. **Google Gemini:** Runs `gemini-2.5-flash` with native schema enforcement.
> 3. **Extractive Offline Fallback:** If API keys are missing or rate limits occur, the system automatically falls back to deterministic extractive summarization so the user is never stranded with an error."*

#### Q10: "What were your concrete evaluation results?"
> **Answer:** *"In our Phase 5 ablation benchmark over 15 standardized academic questions, PaperLens AI outperformed a Naive Flat-Chunking RAG baseline by **+46.6% overall accuracy (93.3% vs 46.7%)**. It showed a **+33.4% boost in fact recall (91.7% vs 58.3%)**, **100% citation validity**, and **100% trap question refusal**, completely eliminating the hallucinations observed in the naive baseline."*

---

## 6. Live 3-Minute Demo Script for Presentations

| Timestamp | Screen / Action | What to Say (Demo Narration) |
| :--- | :--- | :--- |
| **0:00 - 0:30** | **Home Screen & Ingestion**<br>Click **+ Ingest Paper**, select arXiv `1706.03762` ("Attention Is All You Need"), select **⚡ Fast (~2s)**, click Fetch. | *"Welcome to PaperLens AI. Academic papers are notoriously difficult for standard LLMs due to multi-column math and tables. Here, we ingest the foundational Transformer paper. Notice our fast parsing engine parses all 15 pages, section boundaries, and formulas in just 0.16 seconds."* |
| **0:30 - 1:00** | **Smart Markdown Reader**<br>Scroll through Markdown reader. Toggle split-screen divider. Click **Original PDF** toggle. | *"On the left, we have our dual-mode reader. It renders structured Markdown with KaTeX formulas and jump pills. Notice the table and equation micro-badges. If a researcher wants to inspect the original PDF, a single click displays the source document inline."* |
| **1:00 - 1:45** | **Grounded Q&A & Citation Badges**<br>Ask: *"What BLEU score did the big Transformer achieve on WMT 2014 English-to-German?"* | *"Now let's ask a precise numerical metric lookup. Notice our 3-stage RAG stepper: hybrid dense + BM25 search, cross-encoder reranking, and citation-grounded synthesis. The answer appears: '28.4 BLEU' with citation badges [1][2]. Clicking badge [1] shows the exact page number (Page 8), section header, and ground-truth excerpt."* |
| **1:45 - 2:15** | **Trap Question Refusal**<br>Ask: *"What was the BLEU score on the Chinese-to-English translation task?"* | *"Now, let's test hallucination resistance with a trap query. Standard ChatGPT hallucinates a plausible number. PaperLens AI's guardrail intercepts it: 'The paper only evaluates English-German and English-French; no Chinese-to-English results exist'. Refused cleanly with zero hallucination."* |
| **2:15 - 2:45** | **Highlight-to-Ask & Executive Brief**<br>Highlight a sentence on reader $\rightarrow$ click popup. Click **Executive Brief** tab. | *"Researchers can also highlight any text or formula in the reader to ask a targeted question. In the Executive Brief tab, PaperLens automatically generates problem statements, key contributions, and methodology breakdowns."* |
| **2:45 - 3:00** | **Empirical Evaluation Tab**<br>Click **Insights & Benchmarks** tab. Show evaluation bars. | *"Finally, our Insights tab visualizes our Phase 5 ablation benchmark: 93.3% accuracy vs 46.7% for baseline RAG, with 100% citation validity and 100% trap refusal. PaperLens AI delivers verifiable, hallucination-resistant academic research assistance."* |

---

## 7. Repository File & Directory Roadmap

```
d:\prompt project\
│
├── backend/                                # FastAPI Python Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── ingest.py               # Ingest upload & arXiv endpoints + PDF stream
│   │   │       ├── retrieval.py            # RAPTOR index & hybrid retrieval endpoints
│   │   │       └── qa.py                   # Grounded QA, Briefs, Matrices, Eval endpoints
│   │   ├── core/
│   │   │   └── config.py                   # Environment settings (Groq/Gemini, Qdrant path)
│   │   ├── models/
│   │   │   └── schemas.py                  # Pydantic models (Chunks, Nodes, Citations, Briefs)
│   │   ├── services/
│   │   │   ├── parser_service.py           # Fast PDFium + Precision Docling parser
│   │   │   ├── chunker_service.py          # Structure-aware semantic section chunker
│   │   │   ├── raptor_service.py           # Parallel Level 0 + Level 1 hierarchical tree
│   │   │   ├── vector_store_service.py     # Qdrant client, dense FastEmbed & BM25 sparse vectors
│   │   │   ├── retriever_service.py        # RRF (Dense+BM25) + BGE Cross-Encoder reranker
│   │   │   ├── qa_service.py               # Citation-enforced prompt & refusal guardrail
│   │   │   ├── brief_service.py            # Automated paper executive briefings
│   │   │   ├── matrix_service.py           # Multi-paper comparative matrix engine
│   │   │   └── llm_service.py              # Unified Groq / Gemini / Extractive fallback
│   │   └── main.py                         # FastAPI application entry point
│   │
│   ├── data/
│   │   ├── raw/                            # Source downloaded & uploaded PDF files
│   │   ├── processed/                      # Extracted .md, _chunks.json, _brief.json
│   │   ├── qdrant_db/                      # Persistent embedded Qdrant vector database
│   │   ├── eval_dataset.json               # 15-question academic benchmark dataset
│   │   └── eval_results.json               # Empirical benchmark ablation scores
│   │
│   ├── scripts/
│   │   └── evaluate_phase5.py              # Automated ablation benchmarking script
│   │
│   ├── requirements.txt                    # Python dependencies
│   └── .env                                # LLM provider & API keys (Groq / Gemini)
│
├── frontend/                               # React 19 + Vite + Tailwind v4 Workspace
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts                   # Strongly-typed fetch API client
│   │   ├── types/
│   │   │   └── api.ts                      # TypeScript interfaces mirroring backend schemas
│   │   ├── components/
│   │   │   ├── HeaderBar.tsx               # Paper selector, Dark/Light toggle, Ingest button
│   │   │   ├── AddPaperModal.tsx           # Ingest modal with Fast (~2s) vs Docling toggle
│   │   │   ├── PaperReaderPane.tsx         # Split-screen reader (Markdown + PDF iframe)
│   │   │   ├── QATab.tsx                   # Chat UI, RAG stepper, Citation badge popovers
│   │   │   ├── BriefTab.tsx                # Structured executive paper briefings
│   │   │   ├── MatrixTab.tsx               # Multi-paper comparative matrix generator
│   │   │   └── EvalTab.tsx                 # Empirical benchmark visualization & charts
│   │   ├── App.tsx                         # Main workspace layout & split-screen handler
│   │   └── index.css                       # Obsidian & Daylight Tailwind styles
│   └── package.json                        # Frontend packages (Lucide, KaTeX, ReactMarkdown)
│
└── PROJECT_WALKTHROUGH.md                  # This complete technical working guide
```

---

*This concludes the complete technical guide for PaperLens AI. Use this document for project reports, viva presentations, technical interviews, and architecture documentation.*
