export interface CustomerRow {
  [key: string]: string | number;
}

export interface Flag {
  type: 'critical' | 'warning' | 'trend' | 'ok';
  title: string;
  detail: string;
  metric?: string;
}

export interface Segment {
  name: string;
  count: number;
  revenue: number;
  color: string;
  clv12m: number;
  clv24m: number;
  churnRisk: 'low' | 'medium' | 'high';
  avgOrderValue: number;
  description: string;
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  orders?: number;
  newCustomers?: number;
}

export interface CohortRow {
  cohort: string;
  retention: (number | null)[];
}

export interface AnalysisResult {
  summary: {
    totalRevenue: number;
    avgOrderValue: number;
    totalCustomers: number;
    avgNPS: number;
    totalOrders: number;
    revenueGrowth: number;
    topSegment: string;
    churnRiskCount: number;
  };
  flags: Flag[];
  segments: Segment[];
  monthlyTrend: MonthlyPoint[];
  cohortRetention: CohortRow[];
  clvInsight: string;
  executiveSummary: string;
  topOpportunities: string[];
  dataQualityScore: number;
  columnMapping: {
    revenue?: string;
    date?: string;
    customer?: string;
    region?: string;
    tier?: string;
  };
}

export interface AppState {
  apiKey: string;
  data: CustomerRow[];
  columns: string[];
  fileName: string;
  result: AnalysisResult | null;
  loading: boolean;
  loadingStep: string;
  loadingPct: number;
  error: string | null;
  activeTab: string;
  chatHistory: { role: 'user' | 'assistant'; content: string }[];
  chatLoading: boolean;
}
