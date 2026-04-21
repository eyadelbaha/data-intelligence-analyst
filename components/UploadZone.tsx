'use client';
import { useRef, useState } from 'react';
import { Upload, Zap, FileSpreadsheet } from 'lucide-react';

interface UploadZoneProps {
  onFile: (file: File) => void;
  onSample: () => void;
  apiKey: string;
  onApiKeyChange: (k: string) => void;
}

export default function UploadZone({ onFile, onSample, apiKey, onApiKeyChange }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <Zap size={12} className="text-acid" />
            <span className="text-xs font-mono text-acid tracking-widest uppercase">AI-Powered Intelligence</span>
          </div>
          <h1 className="font-display text-7xl text-white mb-4 leading-none tracking-wide">
            DATA<br /><span className="text-acid">ANALYST</span>
          </h1>
          <p className="text-ink-300 text-base max-w-md mx-auto leading-relaxed">
            Upload your Excel or CSV file. Gemini AI analyzes your customer data, flags risks, predicts lifetime value, and generates executive-ready insights.
          </p>
        </div>

        <div className="mb-6 fade-up stagger-2">
          <label className="block text-xs font-mono text-ink-300 uppercase tracking-widest mb-2">Google Gemini API Key — Free</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => onApiKeyChange(e.target.value)}
            placeholder="AIza..."
            className="w-full bg-ink-700 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-ink-500 focus:outline-none focus:border-acid/50"
          />
          <p className="mt-1.5 text-xs text-ink-500 font-mono">Free at aistudio.google.com · 1,500 requests/day · no credit card needed · stored in memory only</p>
        </div>

        <div
          className={`fade-up stagger-3 border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? 'border-acid bg-acid/5' : 'border-white/10 hover:border-white/25 hover:bg-white/2'}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors ${dragging ? 'border-acid/50 bg-acid/10' : 'border-white/10 bg-ink-700'}`}>
              <FileSpreadsheet size={28} className={dragging ? 'text-acid' : 'text-ink-300'} />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Drop your file here</p>
              <p className="text-ink-400 text-sm">.xlsx · .xls · .csv · any customer dataset</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
              className="px-6 py-2.5 rounded-xl border border-white/20 text-sm font-mono text-white hover:border-acid/50 hover:text-acid transition-colors"
            >
              Choose file
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
        </div>

        <div className="mt-4 fade-up stagger-4">
          <button
            onClick={onSample}
            className="w-full py-3 rounded-xl border border-acid/20 bg-acid/5 text-acid text-sm font-mono font-medium hover:bg-acid/10 transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={14} />
            Load demo dataset (200 customers)
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 fade-up stagger-5">
          {[
            { label: 'AI Segmentation', desc: 'RFM clustering and behavior analysis' },
            { label: 'CLV Prediction', desc: '12 and 24-month revenue forecasts' },
            { label: 'Churn Detection', desc: 'At-risk customer identification' },
          ].map(f => (
            <div key={f.label} className="rounded-xl border border-white/5 bg-ink-700/50 p-4">
              <p className="text-xs font-mono text-acid mb-1">{f.label}</p>
              <p className="text-xs text-ink-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
