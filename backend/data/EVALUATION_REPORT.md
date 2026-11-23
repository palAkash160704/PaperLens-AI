# Quantitative Evaluation & Baseline Comparison Report
**System:** PaperLens AI vs. Naive Flat-Chunking Baseline
**Date:** 2026-11-23 21:46:42
**LLM Parity:** `groq` (`qwen/qwen3.8-27b`)

---

## 1. Executive Summary Table (Presentation Ready)

| Metric / Evaluation Dimension | Naive RAG Baseline (500-char) | PaperLens AI (Phase 1–4) | Improvement (Δ) |
| :----------------------------- | :----------------------------: | :-----------------------: | :--------------: |
| **Fact & Keyword Recall**      |   58.3% |   91.7% | **+33.3%** |
| **Citation Validity Rate**     |    0.0% |  100.0% | **+100.0%** |
| **Trap Refusal Accuracy**     |    0.0% |  100.0% | **+100.0%** |
| **Overall Pipeline Accuracy**  |   46.7% |   93.3% | **+46.7%** |
| **Average Query Latency**      |  1.15s | 14.76s | (Includes Hybrid + Reranker) |

---

## 2. Category Accuracy Breakdown

| Category | Questions | Naive Baseline Accuracy | PaperLens AI Accuracy |
| :--- | :---: | :---: | :---: |
| **Broad Synthesis** | 4 | 50.0% | **100.0%** |
| **Equation/Architecture** | 4 | 100.0% | **100.0%** |
| **Table/Metric Lookup** | 4 | 25.0% | **75.0%** |
| **Unanswerable Trap** | 3 | 0.0% | **100.0%** |

---

## 3. Scientific Ablation Analysis
1. **Table & Numerical Lookups:** Docling's markdown table preservation enables precise retrieval of BLEU scores and model parameter counts that naive 500-char splitting slices in half.
2. **Equation & Architecture Mechanics:** RAPTOR section hierarchy and Cross-Encoder reranking prioritize exact mathematical formulations (`d_k`, scaling factor, attention head counts).
3. **Broad Cross-Section Synthesis:** Hierarchical RAPTOR summary nodes allow comprehensive multi-hop coverage without hitting token context limits.
4. **Anti-Hallucination Guardrails:** Dual-layer refusal gate (rerank score threshold + structured refusal check) achieves 100% trap refusal, whereas naive RAG hallucinates answers to out-of-scope trap questions.
