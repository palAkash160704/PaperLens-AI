import { useEffect, useState, useCallback } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { PaperReaderPane } from './components/PaperReaderPane';
import { QATab } from './components/QATab';
import { BriefTab } from './components/BriefTab';
import { MatrixTab } from './components/MatrixTab';
import { InsightsTab } from './components/InsightsTab';
import { AddPaperModal } from './components/AddPaperModal';
import { api } from './api/client';
import type {
  CitationSource,
  PaperContentResponse,
  PaperListItem,
} from './types/api';
import { MessageSquare, FileText, Table2, BarChart3, GripVertical } from 'lucide-react';

export function App() {
  const [papers, setPapers] = useState<PaperListItem[]>([]);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);
  const [paperContent, setPaperContent] = useState<PaperContentResponse | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [llmInfo, setLlmInfo] = useState<{ provider: string; live_llm_enabled: boolean } | null>(null);

  // Theme state: default to Obsidian dark theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('paperlens_theme');
    return saved ? saved === 'dark' : true;
  });

  // Right panel active tab: 'qa' | 'brief' | 'matrix' | 'insights'
  const [activeTab, setActiveTab] = useState<'qa' | 'brief' | 'matrix' | 'insights'>('qa');

  // Active citation highlighted in Left Pane
  const [activeCitation, setActiveCitation] = useState<CitationSource | null>(null);

  // Ingestion modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Split-screen resizable width percentage
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Contextual query from "Highlight-to-Ask"
  const [externalQuery, setExternalQuery] = useState<string | null>(null);

  // Synchronize document theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('daylight');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('daylight');
    }
    localStorage.setItem('paperlens_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // Check backend health
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.checkHealth();
      if (res.status === 'healthy') {
        setApiStatus('online');
        if (res.provider !== undefined && res.live_llm_enabled !== undefined) {
          setLlmInfo({
            provider: res.provider,
            live_llm_enabled: res.live_llm_enabled,
          });
        }
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('offline');
    }
  }, []);

  // Fetch papers list
  const loadPapers = useCallback(
    async (selectIdAfterLoad?: string) => {
      setIsLoadingPapers(true);
      try {
        const list = await api.listPapers();
        setPapers(list);

        if (selectIdAfterLoad) {
          setActivePaperId(selectIdAfterLoad);
        } else if (list.length > 0 && !activePaperId) {
          setActivePaperId(list[0].paper_id);
        }
      } catch (err) {
        console.error('Failed to load papers list:', err);
      } finally {
        setIsLoadingPapers(false);
      }
    },
    [activePaperId]
  );

  // Load paper content when activePaperId changes
  useEffect(() => {
    if (!activePaperId) {
      setPaperContent(null);
      return;
    }

    let isMounted = true;
    const fetchContent = async () => {
      setIsLoadingContent(true);
      try {
        const content = await api.getPaperContent(activePaperId);
        if (isMounted) {
          setPaperContent(content);
        }
      } catch (err) {
        console.error(`Failed to load content for ${activePaperId}:`, err);
        if (isMounted) {
          setPaperContent(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingContent(false);
        }
      }
    };

    fetchContent();
    return () => {
      isMounted = false;
    };
  }, [activePaperId]);

  // Initial mount check & paper load
  useEffect(() => {
    checkHealth();
    loadPapers();
  }, [checkHealth, loadPapers]);

  // Draggable divider event listeners
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const totalWidth = window.innerWidth;
      const newPercent = (e.clientX / totalWidth) * 100;
      if (newPercent >= 25 && newPercent <= 75) {
        setSplitPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle citation selection (from Q&A, Brief, or Matrix)
  const handleSelectCitation = useCallback(
    async (citation: CitationSource, paperId: string) => {
      if (paperId && paperId !== activePaperId) {
        setActivePaperId(paperId);
      }
      setActiveCitation(citation);
    },
    [activePaperId]
  );

  const handleClearCitation = useCallback(() => {
    setActiveCitation(null);
  }, []);

  // Handle text selection from reader pane
  const handleAskAboutSelection = useCallback((selectedText: string, action: 'ask' | 'explain') => {
    setActiveTab('qa');
    if (action === 'explain') {
      setExternalQuery(
        `Please explain this technical passage in clear, intuitive terms for an AI researcher:\n"${selectedText}"`
      );
    } else {
      setExternalQuery(
        `Regarding this excerpt: "${selectedText}", what is its theoretical significance and how does it relate to the paper's core contributions?`
      );
    }
  }, []);

  const handlePaperIngested = useCallback(
    (newPaperId: string) => {
      loadPapers(newPaperId);
    },
    [loadPapers]
  );

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* 1. Top Navigation & Paper Selector */}
      <HeaderBar
        papers={papers}
        activePaperId={activePaperId}
        onSelectPaper={(id) => {
          setActivePaperId(id);
          setActiveCitation(null);
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        apiStatus={apiStatus}
        llmInfo={llmInfo}
        onRefreshPapers={() => loadPapers()}
        isLoadingPapers={isLoadingPapers}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* 2. Main Two-Pane Split-Screen Workspace with Draggable Divider */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Pane: Paper Reader (Markdown or Raw PDF) */}
        <section
          style={{ width: `${splitPercent}%` }}
          className="h-1/2 md:h-full overflow-hidden flex flex-col min-w-0 transition-all duration-75 ease-out"
        >
          <PaperReaderPane
            paperContent={paperContent}
            isLoading={isLoadingContent}
            activeCitation={activeCitation}
            onClearCitation={handleClearCitation}
            isDark={isDark}
            onAskAboutSelection={handleAskAboutSelection}
          />
        </section>

        {/* Draggable Vertical Divider Handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`hidden md:flex items-center justify-center w-2 cursor-col-resize z-30 transition-colors select-none group relative ${
            isDragging
              ? 'bg-indigo-600'
              : isDark
              ? 'bg-slate-900 hover:bg-indigo-600/60 border-x border-slate-800'
              : 'bg-slate-200 hover:bg-indigo-500/60 border-x border-slate-300'
          }`}
          title="Drag to resize workspace panels"
        >
          <div
            className={`p-0.5 rounded transition-transform group-hover:scale-110 ${
              isDragging ? 'text-white' : isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-white'
            }`}
          >
            <GripVertical className="h-4 w-3.5" />
          </div>
        </div>

        {/* Right Pane: AI Analysis Workspace (4 Tabs) */}
        <section
          style={{ width: `${100 - splitPercent}%` }}
          className={`h-1/2 md:h-full flex flex-col min-w-0 overflow-hidden transition-all duration-75 ease-out ${
            isDark ? 'bg-slate-950' : 'bg-slate-50'
          }`}
        >
          {/* Tab Selection Navigation Bar */}
          <div
            className={`flex items-center border-b px-3 pt-2 shrink-0 transition-colors ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'qa'
                  ? 'border-indigo-500 text-indigo-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Grounded Q&A</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('brief')}
              className={`flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'brief'
                  ? 'border-indigo-500 text-indigo-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Executive Brief</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'border-indigo-500 text-indigo-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Comparative Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('insights')}
              className={`flex items-center space-x-1.5 py-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'border-indigo-500 text-indigo-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
              <span>Insights & Benchmarks</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'qa' && (
              <QATab
                activePaperId={activePaperId}
                papers={papers}
                onSelectCitation={handleSelectCitation}
                isDark={isDark}
                externalQuery={externalQuery}
                onClearExternalQuery={() => setExternalQuery(null)}
              />
            )}

            {activeTab === 'brief' && (
              <BriefTab
                activePaperId={activePaperId}
                onSelectCitation={handleSelectCitation}
                isDark={isDark}
              />
            )}

            {activeTab === 'matrix' && (
              <MatrixTab
                papers={papers}
                onSelectCitation={handleSelectCitation}
                isDark={isDark}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsTab
                activePaperId={activePaperId}
                paperContent={paperContent}
                isDark={isDark}
              />
            )}
          </div>
        </section>
      </main>

      {/* 3. Ingestion Modal */}
      <AddPaperModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePaperIngested}
      />
    </div>
  );
}

export default App;
