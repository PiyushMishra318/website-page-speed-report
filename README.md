# website-page-speed-report

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js&logoColor=white)](package.json)

TypeScript CLI that reads a website sitemap, calls the Google PageSpeed Insights API for each URL (desktop and mobile), and writes a JSON performance report.

## Requirements

- Node.js 18+
- Google PageSpeed Insights API key

## Setup

```bash
git clone git@github.com:PiyushMishra318/website-page-speed-report.git
cd website-page-speed-report
npm install
cp .env.example .env
```

Configure `.env`:

```env
PAGESPEED_KEY=your_api_key
TARGET_WEBSITE=https://www.example.com
REPORT_PATH=report.json
```

## Web demo (Vercel)

Deploy with `npx vercel --prod` and set `PAGESPEED_KEY` in the Vercel project settings. Open `/` and enter a URL to analyze desktop + mobile scores via `/api/pagespeed?url=...`.

## CLI usage

```bash
npm run report
```

The tool waits 60 seconds between URLs to respect API rate limits.

## Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run unit tests (no live API calls) |
| `npm run build` | Compile TypeScript |
| `npm run report` | Build and generate `report.json` |

## Output

`report.json` contains per-URL desktop/mobile scores, core metrics, and improvement opportunities.

## License

MIT © 2026 [Piyush Mishra](https://github.com/PiyushMishra318)
