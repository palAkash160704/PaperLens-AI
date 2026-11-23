import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  BookOpen,
  Calendar,
  Users,
  ExternalLink,
  Hash,
  X,
  ArrowDown,
  Sparkles,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { api } from '../api/client';
import type { CitationSource, PaperContentResponse } from '../types/api';

interface PaperReaderPaneProps {
  paperContent: PaperContentResponse | null;
  isLoading: boolean;
  activeCitation: CitationSource | null;
  onClearCitation: () => void;
  isDark: boolean;
  onAskAboutSelection: (selectedText: string, action: 'ask' | 'explain') => void;
}

export const PaperReaderPane: React.FC<PaperReaderPaneProps> = ({
  paperContent,
  isLoading,
  activeCitation,
  onClearCitation,
  isDark,
  onAskAboutSelection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [readerMode, setReaderMode] = useState<'smart' | 'pdf'>('smart');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectionPopover, setSelectionPopover] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Helper to generate slug for section headings
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // Scroll to citation whenever activeCitation changes
  useEffect(() => {
    if (!activeCitation || !containerRef.current || readerMode !== 'smart') return;

    const targetSlug = slugify(activeCitation.section_header);
    const element =
      containerRef.current.querySelector(`[data-section-slug="${targetSlug}"]`) ||
      containerRef.current.querySelector('h1, h2, h3, h4');

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeCitation, readerMode]);

  const scrollToSection = (header: string) => {
    if (!containerRef.current) return;
    const slug = slugify(header);
    const el = containerRef.current.querySelector(`[data-section-slug="${slug}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Track reading scroll progress
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const total = scrollHeight - clientHeight;
    if (total <= 0) {
      setScrollProgress(100);
    } else {
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / total) * 100)));
    }
  }, []);

  // Text selection handler for "Highlight-to-Ask"
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionPopover(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 5) {
      setSelectionPopover(null);
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (containerRect) {
        setSelectionPopover({
          text,
          x: Math.max(40, Math.min(containerRect.width - 160, rect.left - containerRect.left + rect.width / 2)),
          y: Math.max(10, rect.top - containerRect.top - 46),
        });
      }
    } catch {
      setSelectionPopover(null);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`h-full flex flex-col items-center justify-center p-8 text-center transition-colors ${
          isDark ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-500'
        }`}
      >
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Parsing document structure & rendering typography...
        </p>
      </div>
    );
  }

  if (!paperContent) {
    return (
      <div
        className={`h-full flex flex-col items-center justify-center p-8 text-center select-none transition-colors ${
          isDark ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-500'
        }`}
      >
        <div
          className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
            isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'
          }`}
        >
          <BookOpen className="h-7 w-7 text-indigo-500" />
        </div>
        <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          No Research Paper Selected
        </h3>
        <p className={`text-xs max-w-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Choose an indexed paper from the top dropdown or ingest a new PDF/arXiv document to begin analysis.
        </p>
      </div>
    );
  }

  // Helper to collapse small-caps artifacts like "a b s t r a c t" -> "Abstract"
  const collapseSmallCaps = (text: string) => {
    if (!text) return '';
    const mapping: Record<string, string> = {
      abstract: 'Abstract',
      articleinfo: 'Article Info',
      introduction: 'Introduction',
      conclusion: 'Conclusion',
      references: 'References',
      background: 'Background',
      results: 'Results',
      discussion: 'Discussion',
      methodology: 'Methodology',
      methods: 'Methods',
      overview: 'Overview',
      acknowledgements: 'Acknowledgements',
      acknowledgments: 'Acknowledgments',
      experiments: 'Experiments',
    };
    return text.replace(/\b(?:[a-zA-Z]\s+){3,}[a-zA-Z]\b/g, (match) => {
      const collapsed = match.replace(/\s+/g, '').toLowerCase();
      return mapping[collapsed] || match;
    });
  };

  const { metadata, markdown, chunks } = paperContent;
  const cleanedMarkdown = markdown
    ? collapseSmallCaps(markdown.replace(/<!--\s*image\s*-->/gi, ''))
    : '';

  // Patterns for noise headers to filter from the jump pill bar
  const noiseHeaderPatterns = [
    /abstract\s*\/\s*preamble/i,
    /article\s*info/i,
    /contents\s+lists\s+available/i,
    /elsevier/i,
    /sciencedirect/i,
    /journal\s+homepage/i,
  ];

  // Extract unique section headers, sanitize small-caps, and filter noise
  const rawSections = chunks
    .map((c) => collapseSmallCaps(c.section_header || '').trim())
    .filter((h) => h.length > 0 && !noiseHeaderPatterns.some((pattern) => pattern.test(h)));

  const uniqueSections = Array.from(new Set(rawSections));

  const sectionMetadataLookup: Record<string, { hasTable: boolean; hasEquation: boolean }> = {};
  for (const c of chunks) {
    if (!c.section_header) continue;
    const cleanHeader = collapseSmallCaps(c.section_header).trim();
    if (!sectionMetadataLookup[cleanHeader]) {
      sectionMetadataLookup[cleanHeader] = { hasTable: false, hasEquation: false };
    }
    if (c.has_table) sectionMetadataLookup[cleanHeader].hasTable = true;
    if (c.has_equation) sectionMetadataLookup[cleanHeader].hasEquation = true;
  }

  return (
    <div
      className={`h-full flex flex-col overflow-hidden relative transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* 1. Live Reading Progress Bar */}
      <div className={`h-1 w-full ${isDark ? 'bg-slate-900' : 'bg-slate-100'} shrink-0 overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Paper Metadata & Dual-Mode Header Card */}
      <div
        className={`border-b p-4 shrink-0 transition-colors ${
          isDark
            ? 'bg-slate-900/80 border-slate-800/90 text-slate-100'
            : 'bg-slate-50/80 border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                  isDark
                    ? 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60'
                    : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                }`}
              >
                {metadata.source} · {metadata.paper_id}
              </span>

              {/* Segmented Mode Switcher: Smart Reader vs. Original PDF */}
              <div
                className={`inline-flex items-center p-0.5 rounded-lg border text-xs font-semibold ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-200/80 border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setReaderMode('smart')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    readerMode === 'smart'
                      ? isDark
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-indigo-700 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Smart Reader</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReaderMode('pdf')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    readerMode === 'pdf'
                      ? isDark
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-indigo-700 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  <span>Original PDF</span>
                </button>
              </div>
            </div>

            <h2 className="text-base font-bold leading-snug line-clamp-2">{metadata.title}</h2>

            <div
              className={`flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {metadata.authors.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-xs">{metadata.authors.join(', ')}</span>
                </div>
              )}
              {metadata.published_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{metadata.published_date}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{chunks.length} semantic chunks</span>
              </div>
            </div>
          </div>

          {metadata.pdf_url && (
            <a
              href={metadata.pdf_url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors shrink-0 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-2xs'
              }`}
            >
              <span>arXiv</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Section Quick Jump Bar with Rich Micro-Badges & Fade Mask */}
        {readerMode === 'smart' && uniqueSections.length > 0 && (
          <div
            className={`mt-3 pt-2.5 border-t flex items-center gap-1.5 py-0.5 relative ${
              isDark ? 'border-slate-800' : 'border-slate-200/70'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              Jump:
            </span>
            <div className="relative flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pr-8 py-0.5">
                {uniqueSections.slice(0, 15).map((sec) => {
                  const meta = sectionMetadataLookup[sec];
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => scrollToSection(sec)}
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-medium rounded-md border transition-all cursor-pointer truncate max-w-[170px] ${
                        isDark
                          ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-indigo-950/70 hover:border-indigo-700 hover:text-indigo-300'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 shadow-2xs'
                      }`}
                      title={sec}
                    >
                      <span className="truncate">{sec}</span>
                      {meta?.hasTable && (
                        <span
                          title="Contains data table"
                          className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/15 text-emerald-500"
                        >
                          Tab
                        </span>
                      )}
                      {meta?.hasEquation && (
                        <span
                          title="Contains mathematical equation"
                          className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-violet-500/15 text-violet-400"
                        >
                          Eq
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Subtle right-edge fade mask */}
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l ${
                  isDark ? 'from-slate-900' : 'from-slate-50'
                } to-transparent`}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Active Citation Floating Alert Banner */}
      {activeCitation && readerMode === 'smart' && (
        <div
          className={`border-b px-4 py-2.5 shrink-0 flex items-center justify-between shadow-xs animate-slide-up z-10 ${
            isDark
              ? 'bg-amber-950/80 border-amber-800/80 text-amber-200'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500 text-white text-[11px] font-bold shrink-0 mt-0.5">
              {activeCitation.citation_index}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                  Target Section: {activeCitation.section_header || 'General Content'}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isDark ? 'bg-amber-900/60 text-amber-300' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Page {activeCitation.page_number}
                </span>
              </div>
              <p
                className={`text-[11px] line-clamp-1 italic mt-0.5 ${
                  isDark ? 'text-amber-300' : 'text-amber-800'
                }`}
              >
                "{activeCitation.snippet}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => scrollToSection(activeCitation.section_header)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                isDark
                  ? 'bg-amber-800 text-amber-100 hover:bg-amber-700'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <ArrowDown className="h-3 w-3" />
              <span>Jump</span>
            </button>
            <button
              type="button"
              onClick={onClearCitation}
              className="p-1 rounded hover:bg-amber-500/20 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Reader Pane Body */}
      {readerMode === 'pdf' ? (
        <div className="flex-1 w-full h-full relative bg-slate-900 overflow-hidden">
          <iframe
            src={api.getPaperPdfUrl(metadata.paper_id)}
            className="w-full h-full border-none"
            title={`PDF Viewer - ${metadata.title}`}
          />
        </div>
      ) : (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onMouseUp={handleMouseUp}
          className="flex-1 overflow-y-auto px-6 py-6 md:px-8 space-y-4 relative"
        >
          {/* Floating 'Highlight-to-Ask' Action Popover */}
          {selectionPopover && (
            <div
              style={{
                left: `${selectionPopover.x}px`,
                top: `${selectionPopover.y}px`,
                transform: 'translateX(-50%)',
              }}
              className="absolute z-30 inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/95 border border-indigo-500/50 text-white shadow-xl shadow-indigo-950/40 backdrop-blur-md animate-fade-in"
            >
              <button
                type="button"
                onClick={() => {
                  onAskAboutSelection(selectionPopover.text, 'ask');
                  setSelectionPopover(null);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Ask AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAskAboutSelection(selectionPopover.text, 'explain');
                  setSelectionPopover(null);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Explain Simply</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectionPopover(null)}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {cleanedMarkdown ? (
            <div
              className={`prose max-w-none prose-headings:font-semibold prose-p:leading-relaxed ${
                isDark
                  ? 'prose-invert prose-headings:text-slate-100 prose-p:text-slate-300 prose-code:text-indigo-400 prose-code:bg-slate-800/90 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800'
                  : 'prose-slate prose-headings:text-slate-900 prose-p:text-slate-700 prose-code:text-indigo-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100'
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children, ...props }) => {
                    const text = String(children);
                    const slug = slugify(text);
                    return (
                      <h1
                        data-section-slug={slug}
                        className={`text-xl font-bold pb-2 border-b mt-6 mb-3 scroll-mt-6 ${
                          isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
                        }`}
                        {...props}
                      >
                        {children}
                      </h1>
                    );
                  },
                  h2: ({ children, ...props }) => {
                    const text = String(children);
                    const slug = slugify(text);
                    return (
                      <h2
                        data-section-slug={slug}
                        className={`text-lg font-bold pb-1.5 border-b mt-5 mb-2.5 scroll-mt-6 ${
                          isDark ? 'text-slate-100 border-slate-850' : 'text-slate-800 border-slate-100'
                        }`}
                        {...props}
                      >
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children);
                    const slug = slugify(text);
                    return (
                      <h3
                        data-section-slug={slug}
                        className={`text-base font-semibold mt-4 mb-2 scroll-mt-6 ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                        {...props}
                      >
                        {children}
                      </h3>
                    );
                  },
                  table: ({ children, ...props }) => (
                    <div
                      className={`overflow-x-auto my-4 border rounded-xl shadow-xs ${
                        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <table
                        className={`min-w-full divide-y text-xs ${
                          isDark ? 'divide-slate-800' : 'divide-slate-200'
                        }`}
                        {...props}
                      >
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children, ...props }) => (
                    <th
                      className={`px-3 py-2 text-left font-semibold uppercase tracking-wider text-[11px] ${
                        isDark ? 'bg-slate-850 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}
                      {...props}
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children, ...props }) => (
                    <td
                      className={`px-3 py-2 border-t ${
                        isDark ? 'border-slate-800/80 text-slate-300' : 'border-slate-100 text-slate-600'
                      }`}
                      {...props}
                    >
                      {children}
                    </td>
                  ),
                }}
              >
                {cleanedMarkdown}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                Markdown view is unavailable for this paper. Showing semantic chunk stream below:
              </div>
              {chunks.map((chunk) => (
                <div
                  key={chunk.chunk_id}
                  data-section-slug={slugify(chunk.section_header)}
                  className={`p-4 rounded-xl border shadow-xs space-y-1.5 ${
                    isDark
                      ? 'border-slate-800 bg-slate-900 text-slate-200'
                      : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-indigo-400">{chunk.section_header}</span>
                    <span className="text-slate-500">Page {chunk.page_number}</span>
                  </div>
                  <p className="text-xs whitespace-pre-wrap">{chunk.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
