import React, { useState } from 'react';
import { X, Upload, Globe, Check, AlertTriangle, Loader2, ArrowRight, Zap } from 'lucide-react';
import { api } from '../api/client';

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paperId: string) => void;
}

export const AddPaperModal: React.FC<AddPaperModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'arxiv' | 'upload'>('arxiv');
  const [parserMode, setParserMode] = useState<'fast' | 'precision'>('fast');
  const [arxivInput, setArxivInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Pipeline status
  const [status, setStatus] = useState<'idle' | 'ingesting' | 'indexing' | 'success' | 'error'>('idle');
  const [currentStepText, setCurrentStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const resetState = () => {
    setStatus('idle');
    setCurrentStepText('');
    setErrorMessage('');
    setSelectedFile(null);
    setArxivInput('');
  };

  const handleClose = () => {
    if (status === 'ingesting' || status === 'indexing') return;
    resetState();
    onClose();
  };

  const handleArxivSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arxivInput.trim()) return;

    try {
      setStatus('ingesting');
      setCurrentStepText(
        parserMode === 'fast'
          ? 'Fast extracting structured Markdown & page boundaries (~2s)...'
          : 'Downloading PDF and extracting layout with IBM Docling (~15s)...'
      );
      setErrorMessage('');

      // Step 1: Ingest
      const ingestRes = await api.ingestArxiv(arxivInput.trim(), parserMode);
      
      // Step 2: Auto-chain Indexing
      setStatus('indexing');
      setCurrentStepText(`Ingested ${ingestRes.total_chunks} chunks. Indexing into Qdrant with RAPTOR-lite...`);
      await api.indexPaper(ingestRes.paper_id);

      setStatus('success');
      setCurrentStepText('Ingestion and hierarchical indexing complete!');
      setTimeout(() => {
        onSuccess(ingestRes.paper_id);
        resetState();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to ingest arXiv paper.');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setStatus('ingesting');
      setCurrentStepText(
        parserMode === 'fast'
          ? `Fast extracting ${selectedFile.name} (~2s)...`
          : `Uploading ${selectedFile.name} and parsing structure with Docling...`
      );
      setErrorMessage('');

      // Step 1: Ingest Upload
      const ingestRes = await api.ingestUpload(selectedFile, parserMode);

      // Step 2: Auto-chain Indexing
      setStatus('indexing');
      setCurrentStepText(`Ingested ${ingestRes.total_chunks} chunks. Building RAPTOR tree & Qdrant vectors...`);
      await api.indexPaper(ingestRes.paper_id);

      setStatus('success');
      setCurrentStepText('Paper successfully indexed!');
      setTimeout(() => {
        onSuccess(ingestRes.paper_id);
        resetState();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload and parse PDF.');
    }
  };

  const exampleArxivIds = [
    { id: '1706.03762', label: 'Attention Is All You Need' },
    { id: '2005.11401', label: 'Retrieval-Augmented Generation' },
    { id: '2303.08774', label: 'GPT-4 Technical Report' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Ingest New Research Paper</h3>
            <p className="text-xs text-slate-500">Extracts layout, formulas, and builds hierarchical index</p>
          </div>
          <button
            onClick={handleClose}
            disabled={status === 'ingesting' || status === 'indexing'}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('arxiv')}
            disabled={status === 'ingesting' || status === 'indexing'}
            className={`flex items-center space-x-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'arxiv'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>arXiv URL or ID</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            disabled={status === 'ingesting' || status === 'indexing'}
            className={`flex items-center space-x-2 py-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload PDF File</span>
          </button>
        </div>

        {/* Speed / Engine Selector */}
        <div className="px-6 pt-3 pb-0">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Zap className={`h-4 w-4 ${parserMode === 'fast' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <div>
                <div className="text-[11px] font-semibold text-slate-800">Parser Engine</div>
                <div className="text-[10px] text-slate-500">
                  {parserMode === 'fast' ? 'Fast extract (~2s)' : 'Deep layout with Docling (~15s)'}
                </div>
              </div>
            </div>
            <div className="flex bg-slate-200/70 p-0.5 rounded-md text-[11px] font-medium">
              <button
                type="button"
                onClick={() => setParserMode('fast')}
                disabled={status === 'ingesting' || status === 'indexing'}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  parserMode === 'fast'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Fast (~2s)
              </button>
              <button
                type="button"
                onClick={() => setParserMode('precision')}
                disabled={status === 'ingesting' || status === 'indexing'}
                className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                  parserMode === 'precision'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔬 Deep Docling
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'arxiv' ? (
            <form onSubmit={handleArxivSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  arXiv Identifier or Link
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={arxivInput}
                    onChange={(e) => setArxivInput(e.target.value)}
                    placeholder="e.g. 1706.03762 or https://arxiv.org/abs/1706.03762"
                    disabled={status === 'ingesting' || status === 'indexing'}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Quick Pick Examples */}
              <div>
                <span className="text-[11px] font-medium text-slate-500">Quick examples:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {exampleArxivIds.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setArxivInput(item.id)}
                      disabled={status === 'ingesting' || status === 'indexing'}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {item.id} <span className="text-slate-400">({item.label})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!arxivInput.trim() || status === 'ingesting' || status === 'indexing'}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>Fetch & Index Paper</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Research Paper PDF
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    disabled={status === 'ingesting' || status === 'indexing'}
                    className="hidden"
                    id="pdf-upload-input"
                  />
                  <label htmlFor="pdf-upload-input" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-700">
                      {selectedFile ? (
                        <span className="text-indigo-600 font-semibold">{selectedFile.name}</span>
                      ) : (
                        <span>Click to browse or drop PDF here</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">PDF files only (max 30MB)</p>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!selectedFile || status === 'ingesting' || status === 'indexing'}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>Upload & Index Paper</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* Progress / Status Display */}
          {status !== 'idle' && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {status === 'ingesting' || status === 'indexing' ? (
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {status === 'ingesting' ? 'Step 1/2: Ingestion & Chunking' : 'Step 2/2: RAPTOR Hierarchical Indexing'}
                    </p>
                    <p className="text-indigo-700 text-[11px] mt-0.5">{currentStepText}</p>
                  </div>
                </div>
              ) : status === 'success' ? (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-medium">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{currentStepText}</span>
                </div>
              ) : (
                <div className="flex items-start space-x-2 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 text-xs">
                  <AlertTriangle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Operation Failed</p>
                    <p className="text-rose-700 text-[11px] mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
