'use client';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
  BubbleController, ScatterController
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Bar, Line, Doughnut, Bubble } from 'react-chartjs-2';
import type { AnalysisResult } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler, BubbleController, ScatterController);

const fmtK = (v: number) => {
  const n = Math.round(v);
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
  return '$' + n.toLocaleString();
};

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#68687A', font: { size: 10, family: 'JetBrains Mono' } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#68687A', font: { size: 10, family: 'JetBrains Mono' } } },
  },
};

export function RevenueBySegmentChart({ result }: { result: AnalysisResult }) {
  const segs = result.segments;
  return (
    <div style={{ position: 'relative', height: 220 }}>
      <Bar
        data={{
          labels: segs.map(s => s.name),
          datasets: [{
            label: 'Revenue',
            data: segs.map(s => s.revenue),
            backgroundColor: segs.map(s => s.color + 'BB'),
            borderColor: segs.map(s => s.color),
            borderWidth: 1,
            borderRadius: 4,
          }]
        }}
        options={{
          ...baseOptions,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: TooltipItem<any>) => fmtK(ctx.parsed.y) } } },
          scales: {
            ...baseOptions.scales,
            y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: (v) => fmtK(Number(v)) } }
          }
        } as any}
      />
    </div>
  );
}

export function MonthlyTrendChart({ result }: { result: AnalysisResult }) {
  const trend = result.monthlyTrend;
  return (
    <div style={{ position: 'relative', height: 220 }}>
      <Line
        data={{
          labels: trend.map(t => t.month),
          datasets: [
            {
              label: 'Revenue',
              data: trend.map(t => t.revenue),
              borderColor: '#C8FF00',
              backgroundColor: 'rgba(200,255,0,0.06)',
              borderWidth: 2,
              pointRadius: 3,
              pointBackgroundColor: '#C8FF00',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Orders',
              data: trend.map(t => t.orders || 0),
              borderColor: '#00E5FF',
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointRadius: 2,
              pointBackgroundColor: '#00E5FF',
              fill: false,
              tension: 0.4,
              yAxisID: 'y2',
            }
          ]
        }}
        options={{
          ...baseOptions,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: TooltipItem<any>) => ctx.datasetIndex === 0 ? fmtK(ctx.parsed.y) : ctx.parsed.y + ' orders' } } },
          scales: {
            x: baseOptions.scales.x,
            y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: (v) => fmtK(Number(v)) } },
            y2: { position: 'right' as const, grid: { display: false }, ticks: { color: '#00E5FF88', font: { size: 9, family: 'JetBrains Mono' } } },
          }
        } as any}
      />
    </div>
  );
}

export function RFMBubbleChart({ result }: { result: AnalysisResult }) {
  const segs = result.segments;
  return (
    <div style={{ position: 'relative', height: 260 }}>
      <Bubble
        data={{
          datasets: segs.map(s => ({
            label: s.name,
            data: [{ x: s.count, y: Math.round(s.avgOrderValue), r: Math.max(6, Math.min(32, Math.round(s.clv12m / 2500))) }],
            backgroundColor: s.color + '88',
            borderColor: s.color,
            borderWidth: 1.5,
          }))
        }}
        options={{
          ...baseOptions,
          plugins: {
            legend: { display: true, position: 'bottom' as const, labels: { color: '#9898A8', font: { size: 10, family: 'JetBrains Mono' }, boxWidth: 8, padding: 12 } },
            tooltip: { callbacks: { label: (ctx: TooltipItem<any>) => `${ctx.dataset.label}: ${ctx.parsed.x} customers, AOV ${fmtK(ctx.parsed.y)}` } }
          },
          scales: {
            x: { ...baseOptions.scales.x, title: { display: true, text: 'Customer Count', color: '#68687A', font: { size: 10 } } },
            y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: (v) => fmtK(Number(v)) }, title: { display: true, text: 'Avg Order Value', color: '#68687A', font: { size: 10 } } }
          },
          layout: { padding: 16 }
        } as any}
      />
    </div>
  );
}

export function CLVBarChart({ result }: { result: AnalysisResult }) {
  const segs = result.segments;
  return (
    <div style={{ position: 'relative', height: 220 }}>
      <Bar
        data={{
          labels: segs.map(s => s.name),
          datasets: [
            { label: '12-month CLV', data: segs.map(s => s.clv12m), backgroundColor: segs.map(s => s.color + 'AA'), borderRadius: 4 },
            { label: '24-month CLV', data: segs.map(s => s.clv24m), backgroundColor: segs.map(s => s.color + '44'), borderRadius: 4 },
          ]
        }}
        options={{
          ...baseOptions,
          plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: '#9898A8', font: { size: 10, family: 'JetBrains Mono' }, boxWidth: 8 } }, tooltip: { callbacks: { label: (ctx: TooltipItem<any>) => `${ctx.dataset.label}: ${fmtK(ctx.parsed.y)}` } } },
          scales: {
            ...baseOptions.scales,
            y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: (v) => fmtK(Number(v)) } }
          }
        } as any}
      />
    </div>
  );
}

export function ChurnDonutChart({ result }: { result: AnalysisResult }) {
  const segs = result.segments;
  const high = segs.filter(s => s.churnRisk === 'high').reduce((a, b) => a + b.count, 0);
  const med = segs.filter(s => s.churnRisk === 'medium').reduce((a, b) => a + b.count, 0);
  const low = segs.filter(s => s.churnRisk === 'low').reduce((a, b) => a + b.count, 0);
  return (
    <div style={{ position: 'relative', height: 200 }}>
      <Doughnut
        data={{
          labels: ['High Risk', 'Medium Risk', 'Low Risk'],
          datasets: [{ data: [high, med, low], backgroundColor: ['#FF4D1CCC', '#F39C12CC', '#C8FF00CC'], borderColor: ['#FF4D1C', '#F39C12', '#C8FF00'], borderWidth: 1 }]
        }}
        options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' as const, labels: { color: '#9898A8', font: { size: 10, family: 'JetBrains Mono' }, boxWidth: 8, padding: 12 } } } } as any}
      />
    </div>
  );
}

export function NewCustomersTrendChart({ result }: { result: AnalysisResult }) {
  const trend = result.monthlyTrend;
  return (
    <div style={{ position: 'relative', height: 200 }}>
      <Bar
        data={{
          labels: trend.map(t => t.month),
          datasets: [{ label: 'New Customers', data: trend.map(t => t.newCustomers || 0), backgroundColor: '#00E5FF44', borderColor: '#00E5FF', borderWidth: 1, borderRadius: 3 }]
        }}
        options={{ ...baseOptions, plugins: { legend: { display: false } } } as any}
      />
    </div>
  );
}
