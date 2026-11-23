import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Hash,
  Table,
  Sigma,
  Layers,
  Award,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import type { EvalReport, PaperContentResponse } from '../types/api';

interface InsightsTabProps {
  activePaperId: string | null;
  paperContent: PaperContentResponse | null;
  isDark: boolean;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  activePaperId,
  paperContent,
  isDark,
}) => {
  const [report, setReport] = useState<EvalReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchReport = async () => {
    setIsLoadingReport(true);
    setReportError(null);
    try {
      const data = await api.getEvalReport();
      setReport(data);
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Compute paper anatomy stats
  const chunks = paperContent?.chunks || [];
  const totalChunks = chunks.length;
  const tableCount = chunks.filter((c) => c.has_table).length;
  const equationCount = chunks.filter((c) => c.has_equation).length;
  const totalChars = chunks.reduce((acc, c) => acc + c.content.length, 0);
  const avgChunkChars = totalChunks > 0 ? Math.round(totalChars / totalChunks) : 0;

  // Group chunks by section header
  const sectionCounts: Record<string, number> = {};
  for (const c of chunks) {
    const sec = c.section_header || 'Preamble / Frontmatter';
    sectionCounts[sec] = (sectionCounts[sec] || 0) + 1;
  }
  const sortedSections = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div
      className={`h-full flex flex-col overflow-y-auto p-4 md:p-6 space-y-6 transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Header & Quick Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Paper Anatomy & Benchmark Telemetry
            </h2>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time document structure analytics and Phase 5 empirical ablation benchmark results.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReport}
          disabled={isLoadingReport}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs'
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingReport ? 'animate-spin text-indigo-500' : ''}`} />
          <span>Reload Metrics</span>
        </button>
      </div>

      {/* 2. Active Paper Anatomy Telemetry */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Paper Anatomy Telemetry: {paperContent?.metadata.title || activePaperId || 'No Paper'}
          </h3>
          <span className="text-[11px] font-mono text-indigo-400">Docling Structured Parser</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className={`p-3.5 rounded-2xl border shadow-xs transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Semantic Chunks</span>
              <Hash className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-xl font-bold text-indigo-500 mt-2">{totalChunks}</p>
            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Avg ~{avgChunkChars} chars / chunk
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border shadow-xs transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Tables Detected</span>
              <Table className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-emerald-500 mt-2">{tableCount}</p>
            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Preserved Markdown tables
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border shadow-xs transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Formulas Extracted</span>
              <Sigma className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-xl font-bold text-violet-500 mt-2">{equationCount}</p>
            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              LaTeX equations enriched
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border shadow-xs transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Section Headings</span>
              <Layers className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-xl font-bold text-amber-500 mt-2">{sortedSections.length}</p>
            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Hierarchical tree depth 3
            </p>
          </div>
        </div>

        {/* Section Distribution Bars */}
        {sortedSections.length > 0 && (
          <div
            className={`p-4 rounded-2xl border shadow-xs space-y-3 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <span className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Section Chunk Density Distribution:
            </span>
            <div className="space-y-2">
              {sortedSections.slice(0, 7).map(([sec, count]) => {
                const pct = totalChunks > 0 ? Math.round((count / totalChunks) * 100) : 0;
                return (
                  <div key={sec} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`truncate max-w-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {sec}
                      </span>
                      <span className="font-mono text-slate-400">
                        {count} chunks ({pct}%)
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 3. Live Ablation Benchmark Dashboard (Phase 5) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Phase 5 Ablation Benchmark (PaperLens AI vs. Naive Flat-Chunking RAG)
            </h3>
          </div>
          {report && (
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span>Model Parity: {report.active_llm_provider.toUpperCase()} ({report.active_llm_model})</span>
            </span>
          )}
        </div>

        {report ? (
          <div className="space-y-4">
            {/* 4 Metric Comparative Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fact & Keyword Recall */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Fact & Keyword Recall</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{report.metrics_summary.keyword_fact_recall.delta}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-indigo-400 font-medium">PaperLens AI (RAPTOR + BGE)</span>
                    <span className="font-bold text-indigo-400">
                      {report.metrics_summary.keyword_fact_recall.paperlens_ai}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${report.metrics_summary.keyword_fact_recall.paperlens_ai}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Naive Baseline (500-char)</span>
                    <span className="font-bold text-slate-400">
                      {report.metrics_summary.keyword_fact_recall.naive_baseline}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-slate-500 rounded-full"
                      style={{ width: `${report.metrics_summary.keyword_fact_recall.naive_baseline}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Citation Validity Rate */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Citation Validity Rate</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{report.metrics_summary.citation_validity_rate.delta}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-indigo-400 font-medium">PaperLens AI (Verified Nodes)</span>
                    <span className="font-bold text-indigo-400">
                      {report.metrics_summary.citation_validity_rate.paperlens_ai}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${report.metrics_summary.citation_validity_rate.paperlens_ai}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Naive Baseline (Unmapped)</span>
                    <span className="font-bold text-slate-400">
                      {report.metrics_summary.citation_validity_rate.naive_baseline}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-slate-500 rounded-full"
                      style={{ width: `${report.metrics_summary.citation_validity_rate.naive_baseline}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Trap Refusal Accuracy */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Trap Refusal (Anti-Hallucination)</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{report.metrics_summary.trap_refusal_accuracy.delta}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-indigo-400 font-medium">PaperLens AI (Dual Guardrails)</span>
                    <span className="font-bold text-indigo-400">
                      {report.metrics_summary.trap_refusal_accuracy.paperlens_ai}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${report.metrics_summary.trap_refusal_accuracy.paperlens_ai}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Naive Baseline (Hallucinates)</span>
                    <span className="font-bold text-slate-400">
                      {report.metrics_summary.trap_refusal_accuracy.naive_baseline}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-slate-500 rounded-full"
                      style={{ width: `${report.metrics_summary.trap_refusal_accuracy.naive_baseline}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Overall Pipeline Accuracy */}
              <div
                className={`p-4 rounded-2xl border space-y-2.5 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Overall Pipeline Accuracy</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{report.metrics_summary.overall_accuracy.delta}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-indigo-400 font-medium">PaperLens AI (Overall)</span>
                    <span className="font-bold text-indigo-400">
                      {report.metrics_summary.overall_accuracy.paperlens_ai}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${report.metrics_summary.overall_accuracy.paperlens_ai}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Naive Baseline (Overall)</span>
                    <span className="font-bold text-slate-400">
                      {report.metrics_summary.overall_accuracy.naive_baseline}%
                    </span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-slate-500 rounded-full"
                      style={{ width: `${report.metrics_summary.overall_accuracy.naive_baseline}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div
              className={`p-4 rounded-2xl border overflow-x-auto shadow-xs ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className={`text-xs font-bold block mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Ablation Accuracy by Question Category:
              </span>
              <table className={`min-w-full text-xs divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                <thead>
                  <tr className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                    <th className="py-2 text-left font-semibold">Evaluation Dimension</th>
                    <th className="py-2 text-center font-semibold">Questions</th>
                    <th className="py-2 text-center font-semibold">Naive Baseline</th>
                    <th className="py-2 text-center font-semibold">PaperLens AI</th>
                    <th className="py-2 text-right font-semibold">Advantage</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-850' : 'divide-slate-100'}`}>
                  {report.category_breakdown.map((row) => (
                    <tr key={row.category}>
                      <td className={`py-2.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {row.category}
                      </td>
                      <td className="py-2.5 text-center text-slate-400">{row.count}</td>
                      <td className="py-2.5 text-center text-slate-400">
                        {row.baseline_accuracy.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-center font-bold text-indigo-400">
                        {row.paperlens_accuracy.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">
                        +{Math.round(row.paperlens_accuracy - row.baseline_accuracy)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : reportError ? (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-300">
            Could not fetch live evaluation report: {reportError}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading evaluation benchmark results...</span>
          </div>
        )}
      </section>
    </div>
  );
};
