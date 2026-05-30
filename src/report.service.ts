import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';
import { getMetrics, getOpportunities } from './lighthouse';
import { PageReport, StrategyReport } from './types';

export class PageSpeedReportService {
  constructor(
    private readonly apiKey: string,
    private readonly delayMs = 60_000,
  ) {}

  async fetchSitemapUrls(website: string): Promise<string[]> {
    const response = await axios.get(`${website.replace(/\/$/, '')}/sitemap.xml`);
    const parsed = await parseStringPromise(response.data);
    return parsed.urlset.url.map((entry: { loc: string[] }) => entry.loc[0]);
  }

  async runPagespeed(url: string, strategy: 'desktop' | 'mobile'): Promise<StrategyReport> {
    const response = await axios.get(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      {
        params: { url, strategy, key: this.apiKey },
      },
    );
    const lighthouse = response.data.lighthouseResult;
    return {
      score: lighthouse.categories.performance.score * 100,
      stats: getMetrics(lighthouse) as unknown as StrategyReport['stats'],
      opportunities: getOpportunities(lighthouse.audits),
    };
  }

  async buildReport(website: string): Promise<PageReport[]> {
    const urls = await this.fetchSitemapUrls(website);
    const report: PageReport[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const desktop = await this.runPagespeed(url, 'desktop');
      const mobile = await this.runPagespeed(url, 'mobile');
      report.push({ url, desktop, mobile });

      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, this.delayMs));
      }
    }

    return report;
  }

  writeReport(outputPath: string, report: PageReport[]) {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  }
}

export function defaultOutputPath(): string {
  return path.join(process.cwd(), 'report.json');
}
