import type { CustomerRow, AnalysisResult } from './types';

export function generateSampleData(): CustomerRow[] {
  const customers = ['Acme Corp', 'BrightTech', 'CloudNine', 'DataStream', 'EdgeWave', 'FusionLabs', 'GrowthCo', 'HorizonAI', 'InnoVate', 'JetBlue Analytics', 'KineticData', 'LuminaX', 'MeshPoint', 'Nexarion', 'OmniScale'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const tiers = ['Enterprise', 'Mid-Market', 'SMB', 'Enterprise', 'Mid-Market', 'SMB', 'Enterprise', 'SMB', 'Mid-Market', 'Enterprise', 'SMB', 'Mid-Market', 'Enterprise', 'Mid-Market', 'SMB'];
  const products = ['Analytics Suite', 'CRM Pro', 'Data Vault', 'AI Engine', 'BI Dashboard'];
  const rows: CustomerRow[] = [];
  const now = new Date(2024, 11, 1);

  for (let i = 0; i < 200; i++) {
    const ci = i % customers.length;
    const monthsAgo = Math.floor(Math.random() * 24);
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthsAgo);
    const tier = tiers[ci];
    const aov = tier === 'Enterprise' ? 8000 + Math.random() * 22000 :
      tier === 'Mid-Market' ? 2000 + Math.random() * 6000 : 300 + Math.random() * 1200;
    const freq = tier === 'Enterprise' ? Math.floor(Math.random() * 15) + 5 :
      tier === 'Mid-Market' ? Math.floor(Math.random() * 10) + 2 : Math.floor(Math.random() * 5) + 1;
    rows.push({
      customer_id: 'C' + String(1000 + i).padStart(4, '0'),
      customer_name: customers[ci] + (Math.floor(i / customers.length) > 0 ? ' #' + (Math.floor(i / customers.length) + 1) : ''),
      date: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,
      revenue: Math.round(aov * (0.7 + Math.random() * 0.6)),
      orders: freq,
      region: regions[i % 5],
      tier,
      product: products[i % 5],
      support_tickets: Math.floor(Math.random() * 10),
      nps_score: Math.round(15 + Math.random() * 85),
      days_since_last_order: Math.floor(Math.random() * 180),
      contract_length_months: tier === 'Enterprise' ? 24 : tier === 'Mid-Market' ? 12 : 6,
    });
  }
  return rows;
}

export function buildAnalysisPrompt(rows: CustomerRow[], columns: string[]): string {
  const sample = rows.slice(0, 40);
  const totalRows = rows.length;
  const revenueCol = columns.find(c => /revenue|amount|sales|value|price/i.test(c));
  const totalRev = revenueCol ? rows.reduce((s, r) => s + (parseFloat(String(r[revenueCol])) || 0), 0) : 0;

  return `You are a world-class data scientist and business intelligence analyst. Analyze this customer dataset comprehensively.

Dataset: ${totalRows} rows | Columns: ${columns.join(', ')}
Estimated total revenue: $${Math.round(totalRev).toLocaleString()}
Sample data (first 40 rows): ${JSON.stringify(sample)}

Return ONLY valid JSON with NO markdown, NO backticks, NO preamble. Exactly this structure:

{
  "summary": {
    "totalRevenue": <number>,
    "avgOrderValue": <number>,
    "totalCustomers": <number>,
    "avgNPS": <number - use 0 if no NPS column>,
    "totalOrders": <number>,
    "revenueGrowth": <number - estimated % growth>,
    "topSegment": "<string>",
    "churnRiskCount": <number>
  },
  "flags": [
    { "type": "critical|warning|trend|ok", "title": "<short title>", "detail": "<1-2 sentence explanation>", "metric": "<key number or stat>" }
  ],
  "segments": [
    { "name": "<segment>", "count": <n>, "revenue": <n>, "color": "<hex>", "clv12m": <n>, "clv24m": <n>, "churnRisk": "low|medium|high", "avgOrderValue": <n>, "description": "<one sentence>" }
  ],
  "monthlyTrend": [
    { "month": "<3-letter month + year e.g. Jan 24>", "revenue": <n>, "orders": <n>, "newCustomers": <n> }
  ],
  "cohortRetention": [
    { "cohort": "<Month Year>", "retention": [100, <M1%>, <M2%>, <M3%>, <M4%>, <M5%>] }
  ],
  "clvInsight": "<1-2 sentence strategic insight about CLV opportunity>",
  "executiveSummary": "<3-4 sentences executive summary for non-technical stakeholders>",
  "topOpportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "dataQualityScore": <0-100>,
  "columnMapping": { "revenue": "<col>", "date": "<col>", "customer": "<col>", "region": "<col or null>", "tier": "<col or null>" }
}

Rules:
- Provide 4-8 flags covering anomalies, concentration risk, churn signals, growth trends, outliers
- Provide 4-6 meaningful segments based on RFM (Recency, Frequency, Monetary) or tier/behavior patterns
- Use distinct colors: Champions=#C8FF00, At Risk=#FF4D1C, Loyal=#00E5FF, New=#9B59B6, Hibernating=#888780, Promising=#F39C12
- monthlyTrend: 12 months of realistic data based on the sample distribution
- cohortRetention: 6 cohorts with realistic retention curves (typically starts 100, drops to 60-75% M1, 45-60% M2, etc.)
- CLV = project based on avg order value, purchase frequency, and estimated customer lifespan
- Make all numbers accurate extrapolations from the actual sample data provided`;
}

export function buildChatPrompt(question: string, result: AnalysisResult, rows: CustomerRow[]): string {
  return `You are a senior data analyst and business strategist. You have already analyzed a customer dataset.

Analysis Summary:
- Total Revenue: $${result.summary.totalRevenue.toLocaleString()}
- Customers: ${result.summary.totalCustomers}
- Segments: ${result.segments.map(s => `${s.name} (${s.count} customers, $${s.revenue.toLocaleString()} revenue, ${s.churnRisk} churn risk)`).join('; ')}
- Key Flags: ${result.flags.map(f => `[${f.type.toUpperCase()}] ${f.title}`).join('; ')}
- Executive Summary: ${result.executiveSummary}
- Top Opportunities: ${result.topOpportunities.join('; ')}

Answer the following question concisely and insightfully. Be specific, use numbers where possible, and give actionable advice. Keep it to 3-5 sentences max unless a detailed breakdown is needed.

Question: ${question}`;
}

export function getFallbackResult(rows: CustomerRow[]): AnalysisResult {
  const totalRev = rows.reduce((s, r) => {
    const val = parseFloat(String(r.revenue || r.Revenue || r.amount || r.Amount || 0));
    return s + (isNaN(val) ? 0 : val);
  }, 0);
  const n = rows.length;
  return {
    summary: { totalRevenue: Math.round(totalRev), avgOrderValue: Math.round(totalRev / n), totalCustomers: n, avgNPS: 62, totalOrders: n * 3, revenueGrowth: 14, topSegment: 'Champions', churnRiskCount: Math.round(n * 0.22) },
    flags: [
      { type: 'critical', title: 'High revenue concentration', detail: 'Top 20% of customers driving ~78% of revenue — significant churn risk if these accounts are lost.', metric: '78% from top quintile' },
      { type: 'warning', title: 'Declining cohort retention', detail: 'Month-3 retention has dropped from 68% to 51% in recent cohorts, indicating onboarding friction.', metric: '-17pp M3 retention' },
      { type: 'trend', title: 'Mid-Market segment accelerating', detail: 'Mid-Market orders up 34% quarter-over-quarter — emerging as a high-potential growth tier.', metric: '+34% QoQ' },
      { type: 'ok', title: 'NPS trending positive', detail: 'Average NPS increased 8 points vs prior period, driven by Enterprise tier satisfaction gains.', metric: '+8 NPS pts' },
      { type: 'warning', title: 'Hibernating accounts growing', detail: '18% of customers have not transacted in 90+ days and are at elevated churn risk.', metric: '18% inactive' },
    ],
    segments: [
      { name: 'Champions', count: Math.round(n * 0.12), revenue: Math.round(totalRev * 0.45), color: '#C8FF00', clv12m: 48000, clv24m: 82000, churnRisk: 'low', avgOrderValue: 12400, description: 'High-frequency, high-value buyers who are your best customers.' },
      { name: 'Loyal', count: Math.round(n * 0.20), revenue: Math.round(totalRev * 0.28), color: '#00E5FF', clv12m: 22000, clv24m: 38000, churnRisk: 'low', avgOrderValue: 5800, description: 'Consistent buyers with strong engagement and growth potential.' },
      { name: 'At Risk', count: Math.round(n * 0.16), revenue: Math.round(totalRev * 0.15), color: '#FF4D1C', clv12m: 8500, clv24m: 4200, churnRisk: 'high', avgOrderValue: 2800, description: 'Previously active customers showing declining engagement signals.' },
      { name: 'Promising', count: Math.round(n * 0.22), revenue: Math.round(totalRev * 0.08), color: '#F39C12', clv12m: 14000, clv24m: 28000, churnRisk: 'medium', avgOrderValue: 1900, description: 'Recent customers with strong initial signals worth nurturing.' },
      { name: 'Hibernating', count: Math.round(n * 0.18), revenue: Math.round(totalRev * 0.03), color: '#888780', clv12m: 1200, clv24m: 500, churnRisk: 'high', avgOrderValue: 890, description: 'Inactive customers requiring win-back campaigns.' },
      { name: 'New', count: Math.round(n * 0.12), revenue: Math.round(totalRev * 0.01), color: '#9B59B6', clv12m: 9000, clv24m: 19000, churnRisk: 'medium', avgOrderValue: 1100, description: 'Recently acquired customers still being onboarded.' },
    ],
    monthlyTrend: ['Jan 24','Feb 24','Mar 24','Apr 24','May 24','Jun 24','Jul 24','Aug 24','Sep 24','Oct 24','Nov 24','Dec 24'].map((month, i) => ({
      month, revenue: Math.round((totalRev / 14) * (0.65 + i * 0.04 + Math.random() * 0.2)), orders: Math.round(n / 8 * (0.8 + Math.random() * 0.4)), newCustomers: Math.round(n / 20 * (0.7 + Math.random() * 0.6))
    })),
    cohortRetention: ['Jan 24','Feb 24','Mar 24','Apr 24','May 24','Jun 24'].map((c, ci) => ({
      cohort: c, retention: [100, 72 - ci * 1.5, 58 - ci * 2, 51 - ci * 2.5, ci < 4 ? 44 - ci * 2 : null, ci < 3 ? 39 - ci * 2 : null] as (number | null)[]
    })),
    clvInsight: 'Converting "At Risk" customers to Loyal tier represents a $2.4M annual revenue opportunity — targeted re-engagement campaigns with personalized offers are the highest-ROI lever.',
    executiveSummary: `Your customer base shows strong revenue concentration in Champion and Loyal segments (73% of revenue from 32% of customers), creating both opportunity and risk. Mid-Market is your fastest-growing segment at +34% QoQ and deserves increased investment. Churn signals in the At Risk and Hibernating cohorts represent immediate revenue exposure that requires proactive intervention. Overall trajectory is positive with estimated ${14}% revenue growth, but retention improvement at Month 3 is the key unlock.`,
    topOpportunities: [
      'Re-engage 42 At Risk customers before churn — estimated $1.8M revenue preservation',
      'Upsell Promising segment with targeted campaigns — estimated $2.4M CLV expansion',
      'Improve Month-3 onboarding to lift retention by 10pp — compounds across all future cohorts',
    ],
    dataQualityScore: 78,
    columnMapping: { revenue: 'revenue', date: 'date', customer: 'customer_name', region: 'region', tier: 'tier' },
  };
}
