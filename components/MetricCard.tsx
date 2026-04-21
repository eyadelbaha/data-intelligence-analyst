'use client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  accent?: string;
  delay?: number;
}

export default function MetricCard({ label, value, delta, trend = 'neutral', accent = '#C8FF00', delay = 0 }: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#C8FF00' : trend === 'down' ? '#FF4D1C' : '#68687A';

  return (
    <div
      className="fade-up rounded-xl border border-white/5 bg-ink-700 p-5 relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: accent, opacity: 0.6 }} />
      <p className="text-xs font-mono uppercase tracking-widest text-ink-300 mb-2">{label}</p>
      <p className="text-2xl font-mono font-medium text-white leading-none mb-3">{value}</p>
      {delta && (
        <div className="flex items-center gap-1.5">
          <TrendIcon size={12} style={{ color: trendColor }} />
          <span className="text-xs font-mono" style={{ color: trendColor }}>{delta}</span>
        </div>
      )}
    </div>
  );
}
