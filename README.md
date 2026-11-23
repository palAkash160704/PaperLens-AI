# 🔬 PaperLens AI — Research Paper Summarization, Grounded QA & Hierarchical Retrieval

[![FastAPI](https://img.shields.io/badge/FastAPI-0.165-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Qdrant](https://img.shields.io/badge/Qdrant-Hybrid_Vector_DB-DC2626)](https://qdrant.tech)
[![FastEmbed](https://img.shields.io/badge/Embeddings-FastEmbed_ONNX-blue)](https://github.com/qdrant/fastembed)
[![Groq](https://img.shields.io/badge/Groq-Qwen_/_Llama-f55036)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **PaperLens AI** is an advanced, full-stack AI research workspace engineered specifically for academic literature. It overcomes the fundamental failure modes of naive RAG on academic PDFs (layout fragmentation, severed formulas, destroyed tables, and numerical hallucinations) using **RAPTOR-Lite hierarchical trees**, **hybrid dense+sparse search with Reciprocal Rank Fusion**, **Cross-Encoder reranking**, and **citation-enforced grounded Q&A**.

---

## 🌟 Key Highlights

- **⚡ Sub-Second Ingestion & Parsing:** Extracts structured Markdown, exact LaTeX formulas, and page boundaries in **0.16s** using a streaming Google PDFium / PyMuPDF pipeline, with IBM Docling available in precision mode.
- **🧱 Structure-Aware Semantic Chunking:** Chunks strictly along section headers without severing equations or Markdown tables.
- **🌳 RAPTOR-Lite Hierarchical Indexing:** Constructs Level 0 leaf chunks for microscopic fact lookups alongside Level 1 section & paper executive summaries for broad synthesis queries.
- **🎯 Hybrid Retrieval (Dense + BM25) & RRF:** Combines `BAAI/bge-small-en-v1.5` embeddings and BM25 lexical term matching using Reciprocal Rank Fusion ($k=60$).
- **🔍 BGE Cross-Encoder Reranking:** Applies `BAAI/bge-reranker-base` joint token attention across query and passage candidates.
- **🛡️ Verifiable Citations & Hallucination Defense:** Enforces adjacent citation badges (`[1][2]`) mapped to exact page coordinates, with out-of-scope refusal guardrails.
- **📊 Provenance-Aware Research Studio UI:** Built with React 19 and Tailwind v4, featuring Obsidian & Daylight themes, dual-mode Smart Markdown vs. Original PDF view, resizable split-screen, and a "Highlight-to-Ask" selection popup.
- **📈 Empirical Evaluation (Phase 5):** Outperforms flat naive RAG by **+46.6% overall accuracy (93.3% vs 46.7%)**, achieving **100% citation validity** and **100% trap refusal**.

---

## 📊 Benchmark & Evaluation Results

Evaluated across 15 standardized academic benchmark questions covering *Attention Is All You Need* (`1706.03762`) and *RAG* (`2005.11401`) using identical LLM conditions (`qwen/qwen3.8-27b` via Groq):

| Metric | Naive Flat RAG Baseline | PaperLens AI (Our System) | Improvement |
| :--- | :---: | :---: | :---: |
| **Overall Accuracy** | 46.7% | **93.3%** | **+46.6%** |
| **Keyword / Fact Recall** | 58.3% | **91.7%** | **+33.4%** |
| **Citation Validity Rate** | 0.0% | **100.0%** | **+100.0%** |
| **Trap Refusal Accuracy (Hallucination Defense)** | 0.0% | **100.0%** | **+100.0%** |
| **Broad Synthesis Accuracy** | 50.0% | **100.0%** | **+50.0%** |
| **Table / Metric Lookup Accuracy** | 25.0% | **75.0%** | **+50.0%** |

---

## 🏗️ System Architecture

```
  [ arXiv ID / URL ] OR [ Local PDF Upload ]
           │
           ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. INGESTION & SUB-SECOND PARSER                            │
  │    - Fast Engine: Google PDFium / PyMuPDF (0.16s)           │
  │    - Precision Engine: IBM Docling Layout Converter         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 2. STRUCTURE-AWARE SEMANTIC CHUNKING                        │
  │    - Respects section boundaries; zero formula/table cuts   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 3. RAPTOR-LITE HIERARCHICAL INDEX                           │
  │    - Level 0: Fine-grained leaf chunks (Micro details)      │
  │    - Level 1: Section & Executive summaries (Macro context) │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 4. HYBRID RETRIEVAL & CROSS-ENCODER RERANKING               │
  │    - Dense (bge-small-en) + Sparse (BM25) via RRF (k=60)    │
  │    - BGE Cross-Encoder Reranker (joint token attention)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 5. CITATION-ENFORCED GROUNDED LLM GENERATION                │
  │    - Provider: Groq (Qwen/Llama) or Google Gemini           │
  │    - Footnote citation tags: [1], [2] linked to page bounds │
  │    - Out-of-scope trap question refusal                     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ 6. REACT 19 RESEARCH STUDIO WORKSPACE                       │
  │    - Dual View: Smart Markdown Reader & Original PDF View   │
  │    - Interactive citation popovers & Highlight-to-Ask       │
  │    - Automated Paper Briefings & Multi-Paper Comparison     │
  └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- A free API key from [Groq Console](https://console.groq.com) or [Google AI Studio](https://aistudio.google.com)

### 1. Clone the Repository
```bash
git clone https://github.com/palAkash160704/PaperLens-AI.git
cd PaperLens-AI
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
```

Configure your environment variables in `backend/.env`:
```ini
LLM_PROVIDER=groq
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_API_KEY=your_groq_api_key_here

# Optional: Google Gemini
# LLM_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key_here
```

Start the FastAPI backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📖 Complete Documentation
For an in-depth breakdown of every algorithm, viva questions & answers, and component source code maps, read the complete technical reference:
👉 **[PROJECT_WALKTHROUGH.md](PROJECT_WALKTHROUGH.md)**

---

## 📜 License
This project is open-source under the [MIT License](LICENSE).
