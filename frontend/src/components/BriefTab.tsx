import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  FileText,
  RefreshCw,
  Target,
  Layers,
  Database,
  Award,
  AlertOctagon,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { api } from '../api/client';
import type { CitationSource, PaperBrief } from '../types/api';

interface BriefTabProps {
  activePaperId: string | null;
  onSelectCitation: (citation: CitationSource, paperId: string) => void;
  isDark?: boolean;
}

export const BriefTab: React.FC<BriefTabProps> = ({ activePaperId, onSelectCitation, isDark }) => {
  const [brief, setBrief] = useState<PaperBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch brief whenever activePaperId changes
  useEffect(() => {
    if (!activePaperId) {
      setBrief(null);
      setError(null);
      return;
    }

    let isMounted = true;
    const fetchBrief = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getBrief(activePaperId);
        if (isMounted) setBrief(res);
      } catch {
        // If not found in cache, we show prompt to generate
        if (isMounted) setBrief(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBrief();
    return () => {
      isMounted = false;
    };
  }, [activePaperId]);

  const transformCitationsToLinks = (text: string) => {
    if (!text) return '';
    return text.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_match: string, group: string) => {
      const indices = group.split(',').map((s: string) => s.trim()).filter(Boolean);
      return indices.map((idx: string) => `[${idx}](#cite-${idx})`).join('');
    });
  };

  const createMarkdownComponents = (citations?: CitationSource[]) => ({
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      if (href?.startsWith('#cite-')) {
        const citeIndex = parseInt(href.replace('#cite-', ''), 10);
        const matchedCite = citations?.find((c) => c.citation_index === citeIndex);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (matchedCite) {
                onSelectCitation(matchedCite, matchedCite.paper_id);
              }
            }}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-mono text-[10px] font-bold cursor-pointer transition-colors align-baseline"
            title={
              matchedCite
                ? `${matchedCite.section_header} (p.${matchedCite.page_number}): ${matchedCite.snippet.slice(0, 80)}...`
                : `Citation [${citeIndex}]`
            }
          >
            [{children}]
          </button>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
  });

  const handleGenerate = async () => {
    if (!activePaperId) return;
    setIsRegenerating(true);
    setError(null);
    try {
      const res = await api.generateBrief(activePaperId);
      setBrief(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate brief.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!activePaperId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 text-slate-500 select-none">
        <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Paper Selected</h4>
        <p className="text-xs text-slate-400 mt-1">
          Select an active paper to view or generate its structured executive briefing.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Action Header */}
      <div
        className={`p-3 border-b flex items-center justify-between gap-2 shrink-0 transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div>
          <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            5-Part Executive Briefing
          </h3>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{activePaperId}</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || isRegenerating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>{brief ? 'Regenerate Brief' : 'Generate Brief'}</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium text-slate-600">Loading structured brief...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
            <p className="font-bold">Error generating brief:</p>
            <p className="text-rose-700">{error}</p>
            <button
              onClick={handleGenerate}
              className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-2xs"
            >
              Retry
            </button>
          </div>
        ) : !brief ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 select-none">
            <FileText className="h-10 w-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No Brief Generated Yet</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Extract a standardized 5-part synthesis covering Problem, Architecture, Benchmarks, Results, and Limitations.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isRegenerating}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Generate Paper Brief Now
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* 1. Core Problem */}
            <div
              className={`rounded-xl border p-4 shadow-2xs space-y-1.5 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs">
                <Target className="h-4 w-4" />
                <span>1. Core Problem Addressed</span>
              </div>
              <div
                className={`prose prose-xs max-w-none text-xs leading-relaxed ${
                  isDark ? 'prose-invert text-slate-200' : 'prose-slate text-slate-700'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={createMarkdownComponents(brief.citations)}
                >
                  {transformCitationsToLinks(brief.core_problem)}
                </ReactMarkdown>
              </div>
            </div>

            {/* 2. Proposed Architecture */}
            <div
              className={`rounded-xl border p-4 shadow-2xs space-y-1.5 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs">
                <Layers className="h-4 w-4" />
                <span>2. Proposed Architecture & Methodology</span>
              </div>
              <div
                className={`prose prose-xs max-w-none text-xs leading-relaxed ${
                  isDark ? 'prose-invert text-slate-200' : 'prose-slate text-slate-700'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={createMarkdownComponents(brief.citations)}
                >
                  {transformCitationsToLinks(brief.proposed_architecture)}
                </ReactMarkdown>
              </div>
            </div>

            {/* 3. Datasets & Benchmarks */}
            <div
              className={`rounded-xl border p-4 shadow-2xs space-y-1.5 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
                <Database className="h-4 w-4" />
                <span>3. Datasets & Evaluation Benchmarks</span>
              </div>
              <div
                className={`prose prose-xs max-w-none text-xs leading-relaxed ${
                  isDark ? 'prose-invert text-slate-200' : 'prose-slate text-slate-700'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={createMarkdownComponents(brief.citations)}
                >
                  {transformCitationsToLinks(brief.datasets_and_benchmarks)}
                </ReactMarkdown>
              </div>
            </div>

            {/* 4. Key Results */}
            <div
              className={`rounded-xl border p-4 shadow-2xs space-y-1.5 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <Award className="h-4 w-4" />
                <span>4. Key Results & Findings</span>
              </div>
              <div
                className={`prose prose-xs max-w-none text-xs leading-relaxed ${
                  isDark ? 'prose-invert text-slate-200' : 'prose-slate text-slate-700'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={createMarkdownComponents(brief.citations)}
                >
                  {transformCitationsToLinks(brief.key_results)}
                </ReactMarkdown>
              </div>
            </div>

            {/* 5. Stated Limitations */}
            <div
              className={`rounded-xl border p-4 shadow-2xs space-y-1.5 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <AlertOctagon className="h-4 w-4" />
                <span>5. Stated Limitations & Future Work</span>
              </div>
              <div
                className={`prose prose-xs max-w-none text-xs leading-relaxed ${
                  isDark ? 'prose-invert text-slate-200' : 'prose-slate text-slate-700'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={createMarkdownComponents(brief.citations)}
                >
                  {transformCitationsToLinks(brief.stated_limitations)}
                </ReactMarkdown>
              </div>
            </div>

            {/* Evidence Citations */}
            {brief.citations && brief.citations.length > 0 && (
              <div className={`mt-4 pt-3 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Cited Grounding Chunks ({brief.citations.length})</span>
                  <span className="font-normal text-[10px]">Click to verify in left pane</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {brief.citations.map((cite) => (
                    <button
                      key={cite.citation_index}
                      type="button"
                      onClick={() => onSelectCitation(cite, cite.paper_id)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 group ${
                        isDark
                          ? 'bg-slate-850/80 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800 text-slate-300'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-600 text-white font-bold text-[10px] mt-0.5">
                        [{cite.citation_index}]
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {cite.section_header || 'General'}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            p. {cite.page_number}
                          </span>
                        </div>
                        <p className={`text-[11px] line-clamp-2 mt-0.5 italic ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          "{cite.snippet}"
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
