import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  SlidersHorizontal,
  Copy,
  Check,
  CornerDownRight,
} from 'lucide-react';
import { api } from '../api/client';
import type { CitationSource, PaperListItem, QAResponse } from '../types/api';

interface QATabProps {
  activePaperId: string | null;
  papers: PaperListItem[];
  onSelectCitation: (citation: CitationSource, paperId: string) => void;
  isDark: boolean;
  externalQuery?: string | null;
  onClearExternalQuery?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  qaResponse?: QAResponse;
}

export const QATab: React.FC<QATabProps> = ({
  activePaperId,
  papers,
  onSelectCitation,
  isDark,
  externalQuery,
  onClearExternalQuery,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'current' | 'all'>('current');
  const [topK, setTopK] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [ragStep, setRagStep] = useState<1 | 2 | 3>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Animate RAG pipeline stepper while loading
  useEffect(() => {
    if (!isLoading) {
      setRagStep(1);
      return;
    }
    setRagStep(1);
    const t1 = setTimeout(() => setRagStep(2), 1800);
    const t2 = setTimeout(() => setRagStep(3), 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLoading]);

  // Handle external query from "Highlight-to-Ask"
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      handleSend(externalQuery);
      if (onClearExternalQuery) onClearExternalQuery();
    }
  }, [externalQuery]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const transformCitationsToLinks = (text: string) => {
    if (!text) return '';
    return text.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (_match: string, group: string) => {
      const indices = group.split(',').map((s: string) => s.trim()).filter(Boolean);
      return indices.map((idx: string) => `[${idx}](#cite-${idx})`).join('');
    });
  };

  const starterChips = [
    'Summarize the core architecture',
    'What are the key benchmark results?',
    'Explain the mathematical formulation',
    'What limitations do the authors state?',
  ];

  const handleCopyMarkdown = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || query;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setQuery('');
    setIsLoading(true);

    try {
      const paperIds = scope === 'current' && activePaperId ? [activePaperId] : null;
      const res = await api.askQuestion({
        query: textToSend.trim(),
        paper_ids: paperIds,
        top_k: topK,
      });

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        sender: 'assistant',
        text: res.answer,
        qaResponse: res,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        sender: 'assistant',
        text: `Error querying backend: ${err instanceof Error ? err.message : 'Unknown error occurred'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`h-full flex flex-col overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Top Filter & Scope Bar */}
      <div
        className={`p-3 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-300'
            : 'bg-white border-slate-200 text-slate-700'
        }`}
      >
        <div
          className={`flex items-center space-x-1 p-1 rounded-lg border ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setScope('current')}
            title={
              activePaperId
                ? `${papers.find((p) => p.paper_id === activePaperId)?.title || activePaperId} (${activePaperId})`
                : 'No paper selected'
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              scope === 'current'
                ? isDark
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-indigo-700 shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Current Paper
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              scope === 'all'
                ? isDark
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-indigo-700 shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Papers ({papers.length})
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Top-K:</span>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className={`border rounded px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            <option value={3}>3 Chunks</option>
            <option value={5}>5 Chunks</option>
            <option value={8}>8 Chunks</option>
          </select>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Citation-Grounded Research Q&A
            </h4>
            <p className={`text-xs max-w-sm mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Ask deep questions across your indexed papers. Answers feature dual-layer anti-hallucination refusal, inline citations, and verifiable node links.
            </p>

            {/* Starter Chips Grid */}
            <div className="w-full max-w-lg mt-6">
              <span className={`text-[11px] font-bold uppercase tracking-wider block text-left mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Starter Research Prompts:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {starterChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(chip)}
                    disabled={isLoading}
                    className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/70 hover:bg-indigo-950/30 text-slate-300 hover:text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700 hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    <span className="text-xs font-medium line-clamp-2 leading-snug">{chip}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col animate-slide-up ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.sender === 'user' ? (
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-indigo-600 px-4 py-2.5 text-xs text-white shadow-sm font-medium leading-relaxed">
                  {msg.text}
                </div>
              ) : (
                <div
                  className={`max-w-[96%] w-full rounded-2xl rounded-tl-xs p-4 shadow-sm space-y-3 border transition-colors ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {/* Assistant Header, Grounding Badge & Copy Button */}
                  <div className={`flex items-center justify-between pb-2.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        PaperLens AI
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {msg.qaResponse && (
                        msg.qaResponse.is_grounded ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isDark
                                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Grounded in Literature</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isDark
                                ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>Refusal / Insufficient Evidence</span>
                          </span>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyMarkdown(msg.text, msg.id)}
                        title="Copy Response Markdown"
                        className={`inline-flex items-center gap-1 p-1.5 rounded-md border text-[11px] transition-all cursor-pointer ${
                          copiedId === msg.id
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : isDark
                            ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[10px] font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Refusal Alert Banner */}
                  {msg.qaResponse && !msg.qaResponse.is_grounded && msg.qaResponse.refusal_reason && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        isDark
                          ? 'bg-amber-950/60 border-amber-800/80 text-amber-200'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Guardrail Triggered:</p>
                        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                          {msg.qaResponse.refusal_reason}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Answer Body with Markdown & KaTeX */}
                  <div
                    className={`prose max-w-none text-xs leading-relaxed ${
                      isDark
                        ? 'prose-invert text-slate-200 prose-headings:text-slate-100 prose-p:text-slate-300 prose-code:text-indigo-300 prose-code:bg-slate-800/80 prose-code:px-1 prose-code:py-0.5 prose-code:rounded'
                        : 'prose-slate text-slate-800 prose-code:text-indigo-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded'
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        a: ({ href, children, ...props }) => {
                          if (href?.startsWith('#cite-')) {
                            const citeIndex = parseInt(href.replace('#cite-', ''), 10);
                            const matchedCite = msg.qaResponse?.citations?.find(
                              (c) => c.citation_index === citeIndex
                            );
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (matchedCite) {
                                    onSelectCitation(matchedCite, matchedCite.paper_id);
                                  }
                                }}
                                className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono text-[10px] font-bold cursor-pointer transition-colors align-baseline border ${
                                  isDark
                                    ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border-indigo-700/60'
                                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-200'
                                }`}
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
                      }}
                    >
                      {transformCitationsToLinks(msg.text)}
                    </ReactMarkdown>
                  </div>

                  {/* Evidence & Citation Sources Cards */}
                  {msg.qaResponse && msg.qaResponse.citations && msg.qaResponse.citations.length > 0 && (
                    <div className={`mt-3 pt-3 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Retrieved Passages ({msg.qaResponse.citations.length})</span>
                        <span className="font-normal text-[10px]">Click to jump in reader</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.qaResponse.citations.map((cite) => (
                          <button
                            key={cite.citation_index}
                            type="button"
                            onClick={() => onSelectCitation(cite, cite.paper_id)}
                            className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 group ${
                              isDark
                                ? 'bg-slate-850/80 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800 text-slate-300'
                                : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700'
                            }`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-600 text-white font-bold text-[10px] mt-0.5">
                              [{cite.citation_index}]
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 text-[11px]">
                                <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                  {cite.section_header || 'General Content'}
                                </span>
                                <span className="text-slate-500 font-mono text-[10px]">
                                  p. {cite.page_number} · Score: {cite.rerank_score.toFixed(2)}
                                </span>
                              </div>
                              <p className={`text-[11px] line-clamp-2 mt-0.5 italic ${isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                "{cite.snippet}"
                              </p>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 mt-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Clickable Follow-Up Suggestions */}
                  {msg.qaResponse && msg.qaResponse.is_grounded && (
                    <div className={`pt-2 border-t flex flex-wrap items-center gap-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
                        <CornerDownRight className="h-3 w-3" />
                        <span>Follow up:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSend('Can you detail the experimental setup, training compute, and benchmarks?')}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white'
                            : 'bg-slate-100 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        Experimental setup & benchmarks?
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSend('What were the primary ablation findings and limitations?')}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isDark
                            ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white'
                            : 'bg-slate-100 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        Ablations & limitations?
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* 3. Live Animated 3-Stage RAG Pipeline Trace Stepper */}
        {isLoading && (
          <div
            className={`p-4 rounded-2xl border space-y-3 animate-fade-in ${
              isDark
                ? 'bg-slate-900/95 border-indigo-500/40 shadow-xl shadow-indigo-950/30'
                : 'bg-white border-indigo-200 shadow-md shadow-indigo-100'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </div>
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
                  RAG Pipeline Active
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Stage {ragStep} of 3</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                  ragStep >= 1
                    ? isDark
                      ? 'bg-indigo-950/50 text-indigo-300 border border-indigo-800/60'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    : 'text-slate-500'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    ragStep > 1
                      ? 'bg-emerald-500 text-white'
                      : 'bg-indigo-600 text-white animate-pulse'
                  }`}
                >
                  {ragStep > 1 ? '✓' : '1'}
                </span>
                <span className="font-medium">Hybrid Dense + Sparse BM25 Prefetch</span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                  ragStep >= 2
                    ? isDark
                      ? 'bg-indigo-950/50 text-indigo-300 border border-indigo-800/60'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    : 'text-slate-500'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    ragStep > 2
                      ? 'bg-emerald-500 text-white'
                      : ragStep === 2
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {ragStep > 2 ? '✓' : '2'}
                </span>
                <span className="font-medium">BGE Cross-Encoder Reranker</span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                  ragStep >= 3
                    ? isDark
                      ? 'bg-indigo-950/50 text-indigo-300 border border-indigo-800/60'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    : 'text-slate-500'
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    ragStep === 3
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  3
                </span>
                <span className="font-medium">Citation Grounding & Guardrail Verification</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Query Input Bar */}
      <div
        className={`p-3 md:p-4 border-t shrink-0 transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a technical question about this paper..."
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border ${
              isDark
                ? 'bg-slate-800/90 border-slate-700/80 text-white placeholder-slate-400 focus:bg-slate-800'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
            }`}
          />
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white disabled:opacity-40 transition-all cursor-pointer shadow-sm shadow-indigo-600/30"
            title="Send Query"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
