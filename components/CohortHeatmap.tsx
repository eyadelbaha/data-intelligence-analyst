'use client';
import type { CohortRow } from '@/lib/types';

function getColor(v: number | null) {
  if (v === null) return { bg: '#16161F', text: '#3C3C50' };
  if (v >= 80) return { bg: '#C8FF00', text: '#0A0A0F' };
  if (v >= 65) return { bg: '#A0CC00', text: '#0A0A0F' };
  if (v >= 50) return { bg: '#3C7A00', text: '#C8FF00' };
  if (v >= 35) return { bg: '#1E4A00', text: '#A0CC00' };
  if (v >= 20) return { bg: '#0E2800', text: '#68900A' };
  return { bg: '#0A1400', text: '#3C5000' };
}

export default function CohortHeatmap({ data }: { data: CohortRow[] }) {
  const periods = ['M+0', 'M+1', 'M+2', 'M+3', 'M+4', 'M+5'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 text-ink-300 font-medium whitespace-nowrap">Cohort</th>
            {periods.map(p => (
              <th key={p} className="py-2 px-3 text-center text-ink-300 font-medium">{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}>
              <td className="py-1.5 pr-4 text-ink-200 whitespace-nowrap font-medium">{row.cohort}</td>
              {row.retention.map((val, ci) => {
                const { bg, text } = getColor(val);
                return (
                  <td key={ci} className="py-1.5 px-1">
                    <div
                      className="rounded text-center py-1.5 px-2 min-w-[44px] text-xs font-medium transition-transform hover:scale-105"
                      style={{ background: bg, color: text }}
                    >
                      {val !== null ? val + '%' : '—'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-ink-400 font-mono">Retention:</span>
        {[
          { label: '80%+', bg: '#C8FF00', text: '#0A0A0F' },
          { label: '65–79%', bg: '#3C7A00', text: '#C8FF00' },
          { label: '35–64%', bg: '#1E4A00', text: '#A0CC00' },
          { label: '<35%', bg: '#0A1400', text: '#3C5000' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded text-center text-[8px] leading-4 font-mono" style={{ background: s.bg, color: s.text }}>▪</div>
            <span className="text-xs text-ink-400 font-mono">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
