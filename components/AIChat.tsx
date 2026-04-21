'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import type { AnalysisResult, CustomerRow } from '@/lib/types';
import { buildChatPrompt } from '@/lib/analysis';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_QUESTIONS = [
  'Which customers are at highest churn risk?',
  'What is my biggest revenue growth opportunity?',
  'How does my retention compare to industry benchmarks?',
  'Which segment should I prioritize for upsell?',
  'What actions would have the highest ROI right now?',
];

export default function AIChat({ result, rows, apiKey }: { result: AnalysisResult; rows: CustomerRow[]; apiKey: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `I've analyzed your ${result.summary.totalCustomers.toLocaleString()} customers across ${result.segments.length} segments. ${result.executiveSummary} Ask me anything about your data.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(q?: string) {
    const question = q || input.trim();
    if (!question || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      const systemPrompt = buildChatPrompt(question, result, rows);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, messages: [{ role: 'user', content: systemPrompt }] })
      });
      const data = await res.json();
      const text = data.content?.map((b: any) => b.text || '').join('') || data.error || 'No response.';
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect. Please check your API key.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" style={{ maxHeight: 380 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${m.role === 'assistant' ? 'bg-acid-glow border border-acid/30' : 'bg-ink-600 border border-white/10'}`}>
              {m.role === 'assistant' ? <Bot size={13} className="text-acid" /> : <User size={13} className="text-ink-200" />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-ink-700 border border-white/5 text-ink-100' : 'bg-acid/10 border border-acid/20 text-white'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-acid-glow border border-acid/30">
              <Bot size={13} className="text-acid" />
            </div>
            <div className="bg-ink-700 border border-white/5 rounded-xl px-4 py-3">
              <Loader size={14} className="text-acid animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_QUESTIONS.slice(0, 3).map(q => (
          <button key={q} onClick={() => send(q)} className="text-xs font-mono px-3 py-1.5 rounded-full border border-white/10 text-ink-300 hover:border-acid/40 hover:text-acid transition-colors">
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-ink-700 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-ink-400 focus:outline-none focus:border-acid/50 font-body"
          placeholder="Ask anything about your data..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="shrink-0 w-12 h-12 rounded-xl bg-acid flex items-center justify-center hover:bg-acid-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} className="text-ink-900" />
        </button>
      </div>
    </div>
  );
}
