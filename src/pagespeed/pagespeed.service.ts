import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { parseStringPromise } from 'xml2js';
import { getMetrics, getOpportunities } from './lighthouse';
import { PageReport, StrategyReport, UrlAnalysis } from './types';

@Injectable()
export class PagespeedService {
  constructor(
    private readonly config: ConfigService,
    private readonly delayMs = 60_000,
  ) {}

  getApiKey(): string {
    const key = this.config.get<string>('PAGESPEED_KEY');
    if (!key) {
      throw new InternalServerErrorException(
        'PAGESPEED_KEY is not configured on the server',
      );
    }
    return key;
  }

  async fetchSitemapUrls(website: string): Promise<string[]> {
    const response = await axios.get(`${website.replace(/\/$/, '')}/sitemap.xml`);
    const parsed = await parseStringPromise(response.data);
    return parsed.urlset.url.map((entry: { loc: string[] }) => entry.loc[0]);
  }

  async runPagespeed(
    url: string,
    strategy: 'desktop' | 'mobile',
    apiKey?: string,
  ): Promise<StrategyReport> {
    const key = apiKey ?? this.getApiKey();
    const response = await axios.get(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      {
        params: { url, strategy, key },
      },
    );
    const lighthouse = response.data.lighthouseResult;
    return {
      score: lighthouse.categories.performance.score * 100,
      stats: getMetrics(lighthouse) as unknown as StrategyReport['stats'],
      opportunities: getOpportunities(lighthouse.audits),
    };
  }

  async analyzeUrl(url: string): Promise<UrlAnalysis> {
    const trimmed = url?.trim();
    if (!trimmed) {
      throw new BadRequestException('Query parameter url is required');
    }

    try {
      const [desktop, mobile] = await Promise.all([
        this.runPagespeed(trimmed, 'desktop'),
        this.runPagespeed(trimmed, 'mobile'),
      ]);
      return { url: trimmed, desktop, mobile };
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof InternalServerErrorException
      ) {
        throw err;
      }
      const message =
        err instanceof Error ? err.message : 'PageSpeed request failed';
      throw new BadGatewayException(message);
    }
  }

  async buildReport(website: string): Promise<PageReport[]> {
    const urls = await this.fetchSitemapUrls(website);
    const report: PageReport[] = [];

    for (let i = 0; i < urls.length; i++) {
      const pageUrl = urls[i];
      const desktop = await this.runPagespeed(pageUrl, 'desktop');
      const mobile = await this.runPagespeed(pageUrl, 'mobile');
      report.push({ url: pageUrl, desktop, mobile });

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
