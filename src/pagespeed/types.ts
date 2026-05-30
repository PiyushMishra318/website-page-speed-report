export interface AuditSummary {
  title?: string;
  description?: string;
  score?: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
  type?: string;
}

export interface LighthouseMetrics {
  'Largest Contentful Paint': string;
  'First Input Delay': string;
  'Cumulative Layout Shift': string;
  'First Contentful Paint': string;
  'Speed Index': string;
  'Time To Interactive': string;
  'Total Blocking Time': string;
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
