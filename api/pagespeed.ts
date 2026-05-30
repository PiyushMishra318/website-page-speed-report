import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ConfigService } from '@nestjs/config';
import { PagespeedService } from '../src/pagespeed/pagespeed.service';

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
    const config = {
      get: (key: string) => (key === 'PAGESPEED_KEY' ? apiKey : undefined),
    } as ConfigService;
    const service = new PagespeedService(config, 0);
    const result = await service.analyzeUrl(url);
    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PageSpeed request failed';
    const status =
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      typeof (err as { status?: number }).status === 'number'
        ? (err as { status: number }).status
        : 502;
    return res.status(status).json({ error: message });
  }
}
