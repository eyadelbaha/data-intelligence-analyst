'use client';
import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart2, Users, TrendingUp, Target, MessageSquare, AlertTriangle, Download, RefreshCw, Zap, CheckCircle } from 'lucide-react';
import type { AppState, AnalysisResult, CustomerRow } from '@/lib/types';
import { generateSampleData, buildAnalysisPrompt, getFallbackResult } from '@/lib/analysis';
import UploadZone from '@/components/UploadZone';
import MetricCard from '@/components/MetricCard';
import FlagCard from '@/components/FlagCard';
import CohortHeatmap from '@/components/CohortHeatmap';
import AIChat from '@/components/AIChat';
import {
  RevenueBySegmentChart, MonthlyTrendChart, RFMBubbleChart,
  CLVBarChart, ChurnDonutChart, NewCustomersTrendChart
} from '@/components/Charts';

const fmtK = (v: number) => {
  const n = Math.round(v);
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
  return '$' + n.toLocaleString();
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'segments', label: 'Segments', icon: Users },
  { id: 'clv', label: 'CLV Forecast', icon: Target },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
];

const CHURN_COLORS = { high: '#FF4D1C', medium: '#F39C12', low: '#C8FF00' };

export default function Home() {
  const [state, setState] = useState<AppState>({
    apiKey: '',
    data: [],
    columns: [],
    fileName: '',
    result: null,
    loading: false,
    loadingStep: '',
    loadingPct: 0,
    error: null,
    activeTab: 'overview',
    chatHistory: [],
    chatLoading: false,
  });

  const setPartial = (p: Partial<AppState>) => setState(prev => ({ ...prev, ...p }));

  async function analyzeData(rows: CustomerRow[], fileName: string) {
    setPartial({ loading: true, loadingStep: `Parsing ${rows.length} records...`, loadingPct: 10, error: null, result: null, fileName });
    await sleep(300);
    setPartial({ loadingStep: 'Auto-detecting column structure...', loadingPct: 25 });
    await sleep(300);
    const columns = Object.keys(rows[0] || {});
    setPartial({ data: rows, columns, loadingStep: 'Sending to Claude AI for deep analysis...', loadingPct: 45 });

    let result: AnalysisResult;
    try {
      const prompt = buildAnalysisPrompt(rows, columns);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: state.apiKey, messages: [{ role: 'user', content: prompt }] })
      });
      setPartial({ loadingStep: 'Parsing AI insights...', loadingPct: 70 });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const text = data.content?.map((b: any) => b.text || '').join('') || '';
      const clean = text.replace(/```json|```/g, '').trim();
      result = JSON.parse(clean);
    } catch (e) {
      console.warn('AI analysis failed, using fallback:', e);
      result = getFallbackResult(rows);
    }

    setPartial({ loadingStep: 'Rendering charts and visualizations...', loadingPct: 90 });
    await sleep(400);
    setPartial({ result, loading: false, loadingPct: 100, activeTab: 'overview' });
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      let rows: CustomerRow[] = [];
      if (file.name.endsWith('.csv')) {
        const parsed = Papa.parse<CustomerRow>(e.target?.result as string, { header: true, skipEmptyLines: true });
        rows = parsed.data;
      } else {
        const wb = XLSX.read(e.target?.result as ArrayBuffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json<CustomerRow>(ws);
      }
      await analyzeData(rows, file.name);
    };
    if (file.name.endsWith('.csv')) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  }

  function handleSample() {
    const rows = generateSampleData();
    analyzeData(rows, 'sample-customers.csv');
  }

  function reset() {
    setPartial({ result: null, data: [], columns: [], fileName: '', error: null, activeTab: 'overview' });
  }

  if (!state.result && !state.loading) {
    return <UploadZone onFile={handleFile} onSample={handleSample} apiKey={state.apiKey} onApiKeyChange={k => setPartial({ apiKey: k })} />;
  }

  if (state.loading) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="w-full max-w-md text-center px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-acid/30 bg-acid/5 mb-8">
            <Zap size={12} className="text-acid animate-pulse" />
            <span className="text-xs font-mono text-acid tracking-widest uppercase">Analyzing</span>
          </div>
          <h2 className="font-display text-5xl text-white mb-8 tracking-wide">PROCESSING</h2>
          <div className="h-1 bg-ink-700 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-acid rounded-full transition-all duration-500" style={{ width: state.loadingPct + '%' }} />
          </div>
          <p className="text-sm font-mono text-ink-300 mb-2">{state.loadingStep}</p>
          <p className="text-xs font-mono text-ink-500">{state.loadingPct}% complete</p>
        </div>
      </div>
    );
  }

  const r = state.result!;

  return (
    <div className="min-h-screen bg-ink-900">
      {/* Top bar */}
      <header className="border-b border-white/5 bg-ink-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl text-white tracking-wide">DATA<span className="text-acid">ANALYST</span></span>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-xs font-mono text-ink-400">{state.fileName}</span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-acid/10 border border-acid/20">
              <CheckCircle size={10} className="text-acid" />
              <span className="text-xs font-mono text-acid">{r.summary.totalCustomers.toLocaleString()} customers analyzed</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-ink-300 hover:border-white/25 hover:text-white transition-colors">
              <RefreshCw size={11} />
              New analysis
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Executive summary banner */}
        <div className="mb-8 rounded-2xl border border-acid/20 bg-acid/5 p-6 fade-up">
          <div className="flex items-start gap-3">
            <Zap size={16} className="text-acid mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-mono text-acid uppercase tracking-widest mb-2">Executive Summary</p>
              <p className="text-sm text-white leading-relaxed">{r.executiveSummary}</p>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Revenue" value={fmtK(r.summary.totalRevenue)} delta={`+${r.summary.revenueGrowth}% growth`} trend="up" delay={0} />
          <MetricCard label="Total Customers" value={r.summary.totalCustomers.toLocaleString()} delta={`${r.summary.churnRiskCount} at risk`} trend="down" accent="#FF4D1C" delay={50} />
          <MetricCard label="Avg Order Value" value={fmtK(r.summary.avgOrderValue)} delta="per transaction" trend="neutral" accent="#00E5FF" delay={100} />
          <MetricCard label="Avg NPS Score" value={String(Math.round(r.summary.avgNPS))} delta={r.summary.avgNPS >= 50 ? 'Promoter zone' : 'Needs attention'} trend={r.summary.avgNPS >= 50 ? 'up' : 'down'} accent={r.summary.avgNPS >= 50 ? '#C8FF00' : '#FF4D1C'} delay={150} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setPartial({ activeTab: tab.id })}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                  state.activeTab === tab.id
                    ? 'border-acid text-acid'
                    : 'border-transparent text-ink-400 hover:text-ink-200'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {state.activeTab === 'overview' && (
          <div className="space-y-8 fade-up">
            <div>
              <h2 className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={12} className="text-ember" />
                Intelligence Flags
                <span className="px-2 py-0.5 rounded bg-white/5 text-ink-400">{r.flags.length}</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {r.flags.map((f, i) => <FlagCard key={i} flag={f} delay={i * 50} />)}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
                <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">Revenue by Segment</p>
                <RevenueBySegmentChart result={r} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
                <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">Monthly Revenue + Orders</p>
                <MonthlyTrendChart result={r} />
              </div>
            </div>
            <div className="rounded-2xl border border-acid/10 bg-acid/5 p-6">
              <p className="text-xs font-mono text-acid uppercase tracking-widest mb-3">Top Opportunities</p>
              <div className="space-y-3">
                {r.topOpportunities.map((o, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-acid/20 border border-acid/30 flex items-center justify-center text-xs font-mono text-acid">{i + 1}</span>
                    <p className="text-sm text-white leading-relaxed">{o}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Segments Tab */}
        {state.activeTab === 'segments' && (
          <div className="space-y-8 fade-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
                <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">RFM Segment Map — Count × AOV × CLV</p>
                <RFMBubbleChart result={r} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
                <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">Churn Risk Distribution</p>
                <ChurnDonutChart result={r} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-ink-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-4 text-xs font-mono text-ink-400 uppercase tracking-widest">Segment</th>
                    <th className="text-right px-6 py-4 text-xs font-mono text-ink-400 uppercase tracking-widest">Customers</th>
                    <th className="text-right px-6 py-4 text-xs font-mono text-ink-400 uppercase tracking-widest">Revenue</th>
                    <th className="text-right px-6 py-4 text-xs font-mono text-ink-400 uppercase tracking-widest">Avg AOV</th>
                    <th className="text-right px-6 py-4 text-xs font-mono text-ink-400 uppercase tracking-widest">CLV 12m</th>
                    <th className="text-right px-6 py-4 text-xs font-mono text-ink-400 uppercase tracking-widest">Churn Risk</th>
                    <th className="px-6 py-4 text-xs font-mono text-ink-400 uppercase tracking-widest">Revenue Share</th>
                  </tr>
                </thead>
                <tbody>
                  {r.segments.map((s, i) => {
                    const totalRev = r.segments.reduce((a, b) => a + b.revenue, 0);
                    const share = Math.round(s.revenue / totalRev * 100);
                    const riskColor = CHURN_COLORS[s.churnRisk];
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                            <div>
                              <p className="font-medium text-white">{s.name}</p>
                              <p className="text-xs text-ink-400 mt-0.5">{s.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-ink-200">{s.count}</td>
                        <td className="px-6 py-4 text-right font-mono text-white">{fmtK(s.revenue)}</td>
                        <td className="px-6 py-4 text-right font-mono text-ink-200">{fmtK(s.avgOrderValue)}</td>
                        <td className="px-6 py-4 text-right font-mono" style={{ color: s.color }}>{fmtK(s.clv12m)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ color: riskColor, background: riskColor + '18', border: `0.5px solid ${riskColor}40` }}>
                            {s.churnRisk}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-ink-600 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: share + '%', background: s.color }} />
                            </div>
                            <span className="text-xs font-mono text-ink-400 w-8 text-right">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLV Tab */}
        {state.activeTab === 'clv' && (
          <div className="space-y-8 fade-up">
            <div className="rounded-2xl border border-acid/20 bg-acid/5 p-6">
              <p className="text-xs font-mono text-acid uppercase tracking-widest mb-2">CLV Insight</p>
              <p className="text-white leading-relaxed">{r.clvInsight}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {r.segments.map((s, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-ink-800 p-5 fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs font-mono text-ink-300 uppercase tracking-wider">{s.name}</span>
                  </div>
                  <p className="text-xs text-ink-500 font-mono mb-1">12-month CLV</p>
                  <p className="text-2xl font-mono font-medium mb-1" style={{ color: s.color }}>{fmtK(s.clv12m)}</p>
                  <p className="text-xs text-ink-500 font-mono mb-0.5">24-month CLV</p>
                  <p className="text-lg font-mono text-ink-300">{fmtK(s.clv24m)}</p>
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-xs font-mono text-ink-500">{s.count} customers · {fmtK(s.avgOrderValue)} AOV</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
              <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">CLV Forecast — 12m vs 24m by Segment</p>
              <CLVBarChart result={r} />
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {state.activeTab === 'trends' && (
          <div className="space-y-8 fade-up">
            <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
              <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">Cohort Retention Heatmap</p>
              <p className="text-xs text-ink-500 mb-5">Percentage of customers from each acquisition cohort still active each month after joining.</p>
              <CohortHeatmap data={r.cohortRetention} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
                <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">New Customer Acquisition</p>
                <NewCustomersTrendChart result={r} />
              </div>
              <div className="rounded-2xl border border-white/5 bg-ink-800 p-6">
                <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-4">Churn Risk Breakdown</p>
                <ChurnDonutChart result={r} />
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Tab */}
        {state.activeTab === 'chat' && (
          <div className="fade-up">
            <div className="rounded-2xl border border-white/5 bg-ink-800 p-6" style={{ minHeight: 500 }}>
              <p className="text-xs font-mono text-ink-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap size={12} className="text-acid" />
                AI Data Assistant
              </p>
              <AIChat result={r} rows={state.data} apiKey={state.apiKey} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
