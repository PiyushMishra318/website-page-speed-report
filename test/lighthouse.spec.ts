import { getMetrics, getOpportunities } from '../src/lighthouse';

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
        'first-contentful-paint': { displayValue: '1.0 s' },
        'speed-index': { displayValue: '2.0 s' },
        interactive: { displayValue: '3.0 s' },
        'first-meaningful-paint': { displayValue: '1.5 s' },
        'first-cpu-idle': { displayValue: '4.0 s' },
        'estimated-input-latency': { displayValue: '10 ms' },
      },
    });
    expect(metrics['First Contentful Paint']).toBe('1.0 s');
    expect(metrics['Speed Index']).toBe('2.0 s');
  });
});
