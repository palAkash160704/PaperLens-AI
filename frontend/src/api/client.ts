/**
 * API client for interacting with the FastAPI backend.
 */

import type {
  CitationSource,
  DocumentChunk,
  IndexResponse,
  IngestionResponse,
  MatrixRequest,
  MatrixResponse,
  EvalReport,
  PaperBrief,
  PaperContentResponse,
  PaperListItem,
  QARequest,
  QAResponse,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /**
   * Health check
   */
  async checkHealth(): Promise<{ status: string; phase: number; provider?: string; live_llm_enabled?: boolean }> {
    const res = await fetch('/health');
    return handleResponse<{ status: string; phase: number; provider?: string; live_llm_enabled?: boolean }>(res);
  },

  /**
   * List all ingested papers
   */
  async listPapers(): Promise<PaperListItem[]> {
    const res = await fetch(`${API_BASE}/ingest/papers`);
    return handleResponse<PaperListItem[]>(res);
  },

  /**
   * Get full paper content (markdown + chunks)
   */
  async getPaperContent(paperId: string): Promise<PaperContentResponse> {
    const res = await fetch(`${API_BASE}/ingest/papers/${encodeURIComponent(paperId)}/content`);
    return handleResponse<PaperContentResponse>(res);
  },

  /**
   * Ingest a paper via arXiv URL or ID
   */
  async ingestArxiv(urlOrId: string, parserMode: 'fast' | 'precision' = 'fast'): Promise<IngestionResponse> {
    const res = await fetch(`${API_BASE}/ingest/arxiv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ arxiv_url_or_id: urlOrId, parser_mode: parserMode }),
    });
    return handleResponse<IngestionResponse>(res);
  },

  /**
   * Ingest a PDF file by uploading
   */
  async ingestUpload(file: File, parserMode: 'fast' | 'precision' = 'fast'): Promise<IngestionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parser_mode', parserMode);
    const res = await fetch(`${API_BASE}/ingest/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<IngestionResponse>(res);
  },

  /**
   * Trigger RAPTOR hierarchical indexing into Qdrant
   */
  async indexPaper(paperId: string): Promise<IndexResponse> {
    const res = await fetch(`${API_BASE}/index/${encodeURIComponent(paperId)}`, {
      method: 'POST',
    });
    return handleResponse<IndexResponse>(res);
  },

  /**
   * Grounded Question Answering with bracketed citations
   */
  async askQuestion(req: QARequest): Promise<QAResponse> {
    const res = await fetch(`${API_BASE}/qa/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse<QAResponse>(res);
  },

  /**
   * Get cached paper brief
   */
  async getBrief(paperId: string): Promise<PaperBrief> {
    const res = await fetch(`${API_BASE}/papers/${encodeURIComponent(paperId)}/brief`);
    return handleResponse<PaperBrief>(res);
  },

  /**
   * Generate or force-regenerate paper brief
   */
  async generateBrief(paperId: string): Promise<PaperBrief> {
    const res = await fetch(`${API_BASE}/papers/${encodeURIComponent(paperId)}/brief`, {
      method: 'POST',
    });
    return handleResponse<PaperBrief>(res);
  },

  /**
   * Compare 2 to 6 papers in a multi-paper matrix
   */
  async comparePapers(req: MatrixRequest): Promise<MatrixResponse> {
    const res = await fetch(`${API_BASE}/matrix/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse<MatrixResponse>(res);
  },

  /**
   * Get Phase 5 quantitative evaluation & ablation report
   */
  async getEvalReport(): Promise<EvalReport> {
    const res = await fetch('/api/v1/eval/report');
    return handleResponse<EvalReport>(res);
  },

  /**
   * Helper to get inline PDF streaming URL
   */
  getPaperPdfUrl(paperId: string): string {
    return `${API_BASE}/ingest/papers/${encodeURIComponent(paperId)}/pdf`;
  },
};
export type { CitationSource, DocumentChunk, IndexResponse, IngestionResponse, MatrixRequest, MatrixResponse, PaperBrief, PaperContentResponse, PaperListItem, QARequest, QAResponse, EvalReport };
