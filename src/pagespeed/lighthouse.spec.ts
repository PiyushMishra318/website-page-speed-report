import { getMetrics, getOpportunities } from './lighthouse';

describe('lighthouse helpers', () => {
  it('extracts failed opportunities', () => {
    const audits = {
      pass: {
        title: 'Good',
        score: 1,
        scoreDisplayMode: 'numeric',
        details: { type: 'opportunity' },
      },
      fail: {
        title: 'Slow',
        score: 0.2,
        scoreDisplayMode: 'numeric',
        details: { type: 'opportunity' },
      },
    };
    const result = getOpportunities(audits);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Slow');
  });

  it('extracts core metrics', () => {
    const metrics = getMetrics({
      audits: {
        'largest-contentful-paint': { displayValue: '2.5 s' },
        'max-potential-fid': { displayValue: '80 ms' },
        'cumulative-layout-shift': { displayValue: '0.05' },
        'first-contentful-paint': { displayValue: '1.0 s' },
        'speed-index': { displayValue: '2.0 s' },
        interactive: { displayValue: '3.0 s' },
        'total-blocking-time': { displayValue: '150 ms' },
      },
    });
    expect(metrics['Largest Contentful Paint']).toBe('2.5 s');
    expect(metrics['First Input Delay']).toBe('80 ms');
    expect(metrics['Cumulative Layout Shift']).toBe('0.05');
    expect(metrics['First Contentful Paint']).toBe('1.0 s');
    expect(metrics['Speed Index']).toBe('2.0 s');
  });
});
