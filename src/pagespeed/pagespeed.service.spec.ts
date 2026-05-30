import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PagespeedService } from './pagespeed.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PagespeedService', () => {
  const config = {
    get: (key: string) =>
      key === 'PAGESPEED_KEY' ? process.env.PAGESPEED_KEY : undefined,
  } as ConfigService;

  let service: PagespeedService;

  beforeEach(() => {
    process.env.PAGESPEED_KEY = 'test-key';
    service = new PagespeedService(config, 0);
    jest.clearAllMocks();
  });

  it('getApiKey requires PAGESPEED_KEY', () => {
    delete process.env.PAGESPEED_KEY;
    expect(() => service.getApiKey()).toThrow(/PAGESPEED_KEY is not configured/);
  });

  it('runPagespeed maps lighthouse performance data', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        lighthouseResult: {
          categories: { performance: { score: 0.85 } },
          audits: {
            'first-contentful-paint': { displayValue: '1.0 s' },
            'speed-index': { displayValue: '2.0 s' },
            interactive: { displayValue: '3.0 s' },
            'first-meaningful-paint': { displayValue: '1.5 s' },
            'first-cpu-idle': { displayValue: '4.0 s' },
            'estimated-input-latency': { displayValue: '10 ms' },
          },
        },
      },
    });

    const result = await service.runPagespeed('https://example.com', 'desktop');
    expect(result.score).toBe(85);
    expect(result.stats['First Contentful Paint']).toBe('1.0 s');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      expect.objectContaining({
        params: { url: 'https://example.com', strategy: 'desktop', key: 'test-key' },
      }),
    );
  });

  it('analyzeUrl rejects empty url', async () => {
    await expect(service.analyzeUrl('')).rejects.toThrow(/url is required/);
  });
});
