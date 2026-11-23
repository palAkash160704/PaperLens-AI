/**
 * API Type Definitions matching Phase 1 - Phase 4 FastAPI Pydantic Models.
 */

export interface PaperMetadata {
  paper_id: string;
  title: string;
  authors: string[];
  abstract: string;
  published_date: string;
  pdf_url: string;
  source: 'arxiv' | 'upload';
}

export interface DocumentChunk {
  chunk_id: string;
  paper_id: string;
  paper_title: string;
  section_header: string;
  page_number: number;
  chunk_index: number;
  has_table: boolean;
  has_equation: boolean;
  content: string;
}

export interface PaperListItem {
  paper_id: string;
  title: string;
  authors: string[];
  published_date: string;
  source: string;
  total_chunks: number;
  has_brief: boolean;
}

export interface PaperContentResponse {
  metadata: PaperMetadata;
  markdown: string;
  chunks: DocumentChunk[];
}

export interface CitationSource {
  citation_index: number;
  node_id: string;
  paper_id: string;
  paper_title: string;
  section_header: string;
  page_number: number;
  snippet: string;
  rerank_score: number;
}

export interface QARequest {
  query: string;
  paper_ids?: string[] | null;
  top_k?: number;
}

export interface QAResponse {
  query: string;
  answer: string;
  is_grounded: boolean;
  refusal_reason?: string | null;
  citations: CitationSource[];
}

export interface PaperBrief {
  paper_id: string;
  paper_title: string;
  core_problem: string;
  proposed_architecture: string;
  datasets_and_benchmarks: string;
  key_results: string;
  stated_limitations: string;
  citations: CitationSource[];
}

export interface MatrixRequest {
  paper_ids: string[];
  custom_dimensions?: string[] | null;
}

export interface MatrixRow {
  paper_id: string;
  paper_title: string;
  published_date: string;
  problem_addressed: string;
  model_architecture: string;
  datasets_used: string;
  key_metrics: string;
  limitations: string;
  custom_fields: Record<string, string>;
  citations: CitationSource[];
}

export interface MatrixResponse {
  papers_compared: number;
  rows: MatrixRow[];
  synthesis_takeaway: string;
}

export interface EvalMetricSummary {
  paperlens_ai: number;
  naive_baseline: number;
  delta: number;
}

export interface EvalCategoryBreakdown {
  category: string;
  count: number;
  paperlens_accuracy: number;
  baseline_accuracy: number;
}

export interface EvalReport {
  benchmark_date: string;
  active_llm_provider: string;
  active_llm_model: string;
  total_questions: number;
  metrics_summary: {
    keyword_fact_recall: EvalMetricSummary;
    citation_validity_rate: EvalMetricSummary;
    trap_refusal_accuracy: EvalMetricSummary;
    overall_accuracy: EvalMetricSummary;
    average_latency_sec: {
      paperlens_ai: number;
      naive_baseline: number;
    };
  };
  category_breakdown: EvalCategoryBreakdown[];
}

export interface IngestionResponse {
  paper_id: string;
  metadata: PaperMetadata;
  total_chunks: number;
  sample_chunks: DocumentChunk[];
  markdown_path: string;
  chunks_path: string;
}

export interface IndexResponse {
  paper_id: string;
  leaf_nodes_indexed: number;
  summary_nodes_indexed: number;
  total_indexed: number;
}
