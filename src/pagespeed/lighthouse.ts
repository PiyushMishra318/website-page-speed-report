import { AuditSummary } from './types';

const PASS_THRESHOLD = 0.9;

function showAsPassed(audit: AuditSummary): boolean {
  switch (audit.scoreDisplayMode) {
    case 'manual':
    case 'notApplicable':
      return true;
    case 'error':
    case 'informative':
      return false;
    case 'numeric':
    case 'binary':
    default:
      return Number(audit.score) >= PASS_THRESHOLD;
  }
}

export function getOpportunities(
  audits: Record<string, AuditSummary & { details?: { type?: string } }>,
): AuditSummary[] {
  return Object.values(audits)
    .map((item) => ({
      title: item.title,
      description: item.description,
      score: item.score,
      scoreDisplayMode: item.scoreDisplayMode,
      displayValue: item.displayValue,
      type: item.details?.type,
    }))
    .filter((audit) => !showAsPassed(audit) && audit.type === 'opportunity');
}

export function getMetrics(lighthouseResult: {
  audits: Record<string, { displayValue?: string }>;
}): Record<string, string> {
  const audits = lighthouseResult.audits;
  return {
    'Largest Contentful Paint':
      audits['largest-contentful-paint']?.displayValue ?? '',
    'First Input Delay':
      audits['max-potential-fid']?.displayValue ?? '',
    'Cumulative Layout Shift':
      audits['cumulative-layout-shift']?.displayValue ?? '',
    'First Contentful Paint': audits['first-contentful-paint']?.displayValue ?? '',
    'Speed Index': audits['speed-index']?.displayValue ?? '',
    'Time To Interactive': audits['interactive']?.displayValue ?? '',
    'Total Blocking Time':
      audits['total-blocking-time']?.displayValue ?? '',
  };
}
