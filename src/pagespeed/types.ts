export interface AuditSummary {
  title?: string;
  description?: string;
  score?: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
  type?: string;
}

export interface LighthouseMetrics {
  'First Contentful Paint': string;
  'Speed Index': string;
  'Time To Interactive': string;
  'First Meaningful Paint': string;
  'First CPU Idle': string;
  'Estimated Input Latency': string;
}

export interface StrategyReport {
  score: number;
  stats: LighthouseMetrics;
  opportunities: AuditSummary[];
}

export interface PageReport {
  url: string;
  desktop: StrategyReport;
  mobile: StrategyReport;
}

export interface UrlAnalysis {
  url: string;
  desktop: StrategyReport;
  mobile: StrategyReport;
}
