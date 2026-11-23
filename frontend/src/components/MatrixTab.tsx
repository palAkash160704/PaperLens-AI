import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  Table2,
  Download,
  Plus,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import type { CitationSource, MatrixResponse, PaperListItem } from '../types/api';

interface MatrixTabProps {
  papers: PaperListItem[];
  onSelectCitation: (citation: CitationSource, paperId: string) => void;
  isDark?: boolean;
}

export const MatrixTab: React.FC<MatrixTabProps> = ({ papers, onSelectCitation, isDark }) => {
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(() => {
    return papers.slice(0, 3).map((p) => p.paper_id);
  });
  const [customDimensionInput, setCustomDimensionInput] = useState('');
  const [customDimensions, setCustomDimensions] = useState<string[]>([
    'Training Objective',
    'Hardware / Compute',
  ]);
  const [matrixData, setMatrixData] = useState<MatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePaper = (paperId: string) => {
    setSelectedPaperIds((prev) => {
      if (prev.includes(paperId)) {
        return prev.filter((id) => id !== paperId);
      } else {
        if (prev.length >= 6) return prev; // max 6
        return [...prev, paperId];
      }
    });
  };

  const handleAddDimension = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customDimensionInput.trim();
    if (trimmed && !customDimensions.includes(trimmed)) {
      setCustomDimensions([...customDimensions, trimmed]);
      setCustomDimensionInput('');
    }
  };

  const handleRemoveDimension = (dim: string) => {
    setCustomDimensions(customDimensions.filter((d) => d !== dim));
  };

  const handleGenerateMatrix = async () => {
    if (selectedPaperIds.length < 2) {
      setError('Please select at least 2 papers to compare.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.comparePapers({
        paper_ids: selectedPaperIds,
        custom_dimensions: customDimensions.length > 0 ? customDimensions : undefined,
      });
      setMatrixData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate comparison matrix.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    if (!matrixData) return;
    const headers = [
      'Dimension',
      ...matrixData.rows.map((r) => `"${r.paper_title.replace(/"/g, '""')} (${r.paper_id})"`),
    ];

    const standardRows = [
      ['Problem Addressed', ...matrixData.rows.map((r) => `"${r.problem_addressed.replace(/"/g, '""')}"`)],
      ['Model Architecture', ...matrixData.rows.map((r) => `"${r.model_architecture.replace(/"/g, '""')}"`)],
      ['Datasets Used', ...matrixData.rows.map((r) => `"${r.datasets_used.replace(/"/g, '""')}"`)],
      ['Key Metrics', ...matrixData.rows.map((r) => `"${r.key_metrics.replace(/"/g, '""')}"`)],
      ['Limitations', ...matrixData.rows.map((r) => `"${r.limitations.replace(/"/g, '""')}"`)],
    ];

    // Custom dimensions
    customDimensions.forEach((dim) => {
      standardRows.push([
        dim,
        ...matrixData.rows.map((r) => `"${(r.custom_fields[dim] || 'N/A').replace(/"/g, '""')}"`),
      ]);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...standardRows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `literature_matrix_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!matrixData) return;
    const jsonStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(matrixData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `literature_matrix_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`h-full flex flex-col overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Configuration Bar */}
      <div
        className={`p-4 border-b space-y-3 shrink-0 shadow-2xs transition-colors ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Select Papers to Compare (2 to 6):
            </label>
            <span className="text-[11px] font-semibold text-indigo-400">
              {selectedPaperIds.length} of 6 selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {papers.map((p) => {
              const isChecked = selectedPaperIds.includes(p.paper_id);
              return (
                <button
                  key={p.paper_id}
                  type="button"
                  onClick={() => togglePaper(p.paper_id)}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    isChecked
                      ? isDark
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-xs'
                        : 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-2xs'
                      : isDark
                      ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isChecked ? 'bg-indigo-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                  />
                  <span className="truncate max-w-[160px]">{p.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Dimensions Input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-800">Custom Comparison Dimensions:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {customDimensions.map((dim) => (
              <span
                key={dim}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {dim}
                <button
                  type="button"
                  onClick={() => handleRemoveDimension(dim)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            <form onSubmit={handleAddDimension} className="inline-flex items-center gap-1">
              <input
                type="text"
                value={customDimensionInput}
                onChange={(e) => setCustomDimensionInput(e.target.value)}
                placeholder="+ Add dimension..."
                className="px-2 py-0.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50 w-32"
              />
              <button
                type="submit"
                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Generate Button & Export Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleGenerateMatrix}
            disabled={selectedPaperIds.length < 2 || isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all disabled:opacity-40 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Synthesizing Comparative Matrix...</span>
              </>
            ) : (
              <>
                <Table2 className="h-4 w-4" />
                <span>Generate Comparative Matrix</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {matrixData && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={exportJSON}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export JSON</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}
      </div>

      {/* Main Table & Synthesis Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!matrixData ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 select-none">
            <Layers className="h-10 w-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">Multi-Paper Synthesis Matrix</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select 2 or more papers above and click Generate to extract side-by-side architectural paradigms, key metrics, and overarching trade-offs.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cross-Paper Synthesis Banner */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Cross-Paper Synthesis & Architectural Takeaways</span>
              </div>
              <div className="prose prose-slate prose-xs max-w-none text-indigo-950 text-xs leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {matrixData.synthesis_takeaway}
                </ReactMarkdown>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-700 uppercase tracking-wider w-44 shrink-0 bg-slate-100/70 border-r border-slate-200">
                      Dimension
                    </th>
                    {matrixData.rows.map((row) => (
                      <th
                        key={row.paper_id}
                        className="px-4 py-3 font-bold text-slate-900 min-w-[240px] max-w-[320px] align-top border-r border-slate-100 last:border-r-0"
                      >
                        <div className="space-y-0.5">
                          <p className="text-indigo-600 text-[10px] font-mono">{row.paper_id}</p>
                          <p className="text-xs font-bold leading-snug line-clamp-2">
                            {row.paper_title}
                          </p>
                          {row.published_date && (
                            <p className="text-[10px] text-slate-400">{row.published_date}</p>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {/* Problem */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Problem Addressed
                    </td>
                    {matrixData.rows.map((row) => (
                      <td
                        key={row.paper_id}
                        className="px-4 py-3 text-slate-700 align-top border-r border-slate-100 last:border-r-0 leading-relaxed"
                      >
                        {row.problem_addressed}
                      </td>
                    ))}
                  </tr>

                  {/* Architecture */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Model Architecture
                    </td>
                    {matrixData.rows.map((row) => (
                      <td
                        key={row.paper_id}
                        className="px-4 py-3 text-slate-700 align-top border-r border-slate-100 last:border-r-0 leading-relaxed"
                      >
                        {row.model_architecture}
                      </td>
                    ))}
                  </tr>

                  {/* Datasets */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Datasets Used
                    </td>
                    {matrixData.rows.map((row) => (
                      <td
                        key={row.paper_id}
                        className="px-4 py-3 text-slate-700 align-top border-r border-slate-100 last:border-r-0 leading-relaxed"
                      >
                        {row.datasets_used}
                      </td>
                    ))}
                  </tr>

                  {/* Metrics */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Key Metrics / Results
                    </td>
                    {matrixData.rows.map((row) => (
                      <td
                        key={row.paper_id}
                        className="px-4 py-3 text-slate-700 align-top border-r border-slate-100 last:border-r-0 leading-relaxed"
                      >
                        {row.key_metrics}
                      </td>
                    ))}
                  </tr>

                  {/* Limitations */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Stated Limitations
                    </td>
                    {matrixData.rows.map((row) => (
                      <td
                        key={row.paper_id}
                        className="px-4 py-3 text-slate-700 align-top border-r border-slate-100 last:border-r-0 leading-relaxed"
                      >
                        {row.limitations}
                      </td>
                    ))}
                  </tr>

                  {/* Custom Dimensions */}
                  {customDimensions.map((dim) => (
                    <tr key={dim}>
                      <td className="px-4 py-3 font-semibold text-indigo-900 bg-indigo-50/20 border-r border-slate-200 align-top">
                        {dim}
                      </td>
                      {matrixData.rows.map((row) => (
                        <td
                          key={row.paper_id}
                          className="px-4 py-3 text-slate-700 align-top border-r border-slate-100 last:border-r-0 leading-relaxed"
                        >
                          {row.custom_fields[dim] || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Grounded Evidence Chunks */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-800 bg-slate-50/50 border-r border-slate-200 align-top">
                      Cited Evidence
                    </td>
                    {matrixData.rows.map((row) => (
                      <td
                        key={row.paper_id}
                        className="px-4 py-3 align-top border-r border-slate-100 last:border-r-0"
                      >
                        {row.citations && row.citations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.citations.map((cite) => (
                              <button
                                key={cite.citation_index}
                                type="button"
                                onClick={() => onSelectCitation(cite, row.paper_id)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 text-[10px] font-mono transition-colors cursor-pointer"
                                title={`${cite.section_header} (p.${cite.page_number}): ${cite.snippet}`}
                              >
                                <span>[{cite.citation_index}]</span>
                                <ExternalLink className="h-2.5 w-2.5" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
