'use client';
import { AlertTriangle, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import type { Flag } from '@/lib/types';

const config = {
  critical: { icon: XCircle, color: '#FF4D1C', bg: '#FF4D1C12', border: '#FF4D1C30', label: 'CRITICAL' },
  warning: { icon: AlertTriangle, color: '#F39C12', bg: '#F39C1212', border: '#F39C1230', label: 'WARNING' },
  trend: { icon: TrendingUp, color: '#00E5FF', bg: '#00E5FF12', border: '#00E5FF30', label: 'TREND' },
  ok: { icon: CheckCircle, color: '#C8FF00', bg: '#C8FF0012', border: '#C8FF0030', label: 'HEALTHY' },
};

export default function FlagCard({ flag, delay = 0 }: { flag: Flag; delay?: number }) {
  const cfg = config[flag.type];
  const Icon = cfg.icon;

  return (
    <div
      className="fade-up flex items-start gap-4 rounded-xl p-4 border"
      style={{ background: cfg.bg, borderColor: cfg.border, animationDelay: `${delay}ms` }}
    >
      <div className="mt-0.5 shrink-0">
        <Icon size={16} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded" style={{ color: cfg.color, background: cfg.bg, border: `0.5px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
          <span className="text-sm font-medium text-white">{flag.title}</span>
        </div>
        <p className="text-xs text-ink-300 leading-relaxed">{flag.detail}</p>
        {flag.metric && (
          <p className="mt-1.5 text-xs font-mono" style={{ color: cfg.color }}>{flag.metric}</p>
        )}
      </div>
    </div>
  );
}
