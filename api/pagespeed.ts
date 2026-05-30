import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PageSpeedReportService } from '../src/report.service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET with ?url=' });
  }

  const url = (req.query.url as string)?.trim();
  const apiKey = process.env.PAGESPEED_KEY;

  if (!url) {
    return res.status(400).json({ error: 'Query parameter url is required' });
  }
  if (!apiKey) {
    return res.status(500).json({ error: 'PAGESPEED_KEY is not configured on the server' });
  }

  try {
    const service = new PageSpeedReportService(apiKey, 0);
    const [desktop, mobile] = await Promise.all([
      service.runPagespeed(url, 'desktop'),
      service.runPagespeed(url, 'mobile'),
    ]);
    return res.status(200).json({ url, desktop, mobile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PageSpeed request failed';
    return res.status(502).json({ error: message });
  }
}
