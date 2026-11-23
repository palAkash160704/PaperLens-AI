import React from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import type { PaperListItem } from '../types/api';

interface HeaderBarProps {
  papers: PaperListItem[];
  activePaperId: string | null;
  onSelectPaper: (paperId: string) => void;
  onOpenAddModal: () => void;
  apiStatus: 'checking' | 'online' | 'offline';
  llmInfo?: {
    provider: string;
    live_llm_enabled: boolean;
  } | null;
  onRefreshPapers: () => void;
  isLoadingPapers: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  papers,
  activePaperId,
  onSelectPaper,
  onOpenAddModal,
  apiStatus,
  llmInfo,
  onRefreshPapers,
  isLoadingPapers,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header
      className={`h-16 border-b px-4 md:px-6 flex items-center justify-between transition-colors duration-200 select-none z-20 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800/80 text-slate-100 shadow-md backdrop-blur-md'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs backdrop-blur-md'
      }`}
    >
      {/* Brand & Title */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1
              className={`text-base font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              PaperLens AI
            </h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase border ${
                isDark
                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
              }`}
            >
              RAPTOR + Qdrant
            </span>
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Research Paper Summarization & Grounded QA
          </p>
        </div>
      </div>

      {/* Middle: Active Paper Selector */}
      <div className="flex items-center space-x-2 max-w-md w-full mx-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <FileText className="h-4 w-4" />
          </div>
          <select
            value={activePaperId || ''}
            onChange={(e) => onSelectPaper(e.target.value)}
            disabled={papers.length === 0}
            className={`w-full pl-9 pr-8 py-1.5 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all truncate disabled:opacity-50 border ${
              isDark
                ? 'bg-slate-800/90 border-slate-700/80 text-slate-200 focus:bg-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
            }`}
          >
            {papers.length === 0 ? (
              <option value="">No papers loaded yet</option>
            ) : (
              papers.map((p) => (
                <option key={p.paper_id} value={p.paper_id} title={`${p.title} (${p.paper_id})`}>
                  {p.title}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={onRefreshPapers}
          title="Refresh papers list"
          disabled={isLoadingPapers}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoadingPapers ? 'animate-spin text-indigo-500' : ''}`}
          />
        </button>
      </div>

      {/* Right: Actions, Badges & Theme Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* LLM Mode Badge */}
        {llmInfo && (
          <div
            className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
              llmInfo.live_llm_enabled
                ? isDark
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isDark
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${
                llmInfo.live_llm_enabled ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <span>
              {llmInfo.live_llm_enabled
                ? llmInfo.provider.toLowerCase() === 'gemini'
                  ? 'Gemini Live'
                  : 'Groq Live'
                : 'Offline Fallback'}
            </span>
          </div>
        )}

        {/* API Status Badge */}
        <div
          className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isDark
              ? 'bg-slate-800/80 border-slate-700 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          {apiStatus === 'online' ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Online</span>
            </>
          ) : apiStatus === 'checking' ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-amber-500 animate-spin" />
              <span>Connecting</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-rose-400">Offline</span>
            </>
          )}
        </div>

        {/* Theme Toggle Button (Sun / Moon) */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Daylight Theme' : 'Switch to Obsidian Theme'}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700 hover:text-amber-200'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Ingest Paper Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Ingest Paper</span>
        </button>
      </div>
    </header>
  );
};
