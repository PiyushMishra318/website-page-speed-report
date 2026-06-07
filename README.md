# Author's Note

> An old project I made just for fun. Nothing new or impressive just a proxy for https://pagespeed.web.dev. When I was working a CMS Platform.
> Used AI to upgrade the tech stack a bit recently. Probably will archive this at some point too.

# website-page-speed-report

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js&logoColor=white)](package.json)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs&logoColor=white)](https://nestjs.com/)

NestJS + TypeScript service that wraps the Google PageSpeed Insights API. Analyze a single URL via HTTP or crawl a sitemap and write a JSON report from the CLI.

## Requirements

- Node.js 18+
- Google PageSpeed Insights API key

## How to get PAGESPEED_KEY

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the [PageSpeed Insights API](https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com)
3. Create an API key under **APIs & Services → Credentials**
4. Set the key as `PAGESPEED_KEY` in your local `.env` and in Vercel project environment variables

See the official guide: [PageSpeed Insights API — Get Started](https://developers.google.com/speed/docs/insights/v5/get-started)

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

## Usage

### Web demo (local or Vercel)

```bash
npm run start:dev
```

Open `http://localhost:3000/`, enter a URL, and click **Analyze**. The demo UI shows:

- **Performance scores** for desktop and mobile (color-coded 0–100)
- **Core Web Vitals and lab metrics** when returned by PageSpeed (LCP, FID, CLS, FCP, Speed Index, TTI, TBT)
- **Top improvement opportunities** (up to five per strategy)
- **Loading state** while both strategies run (can take up to a minute)
- **Clear error messages** when the URL is invalid or the API key is missing

The layout uses a URL form at the top, then side-by-side desktop/mobile cards with color-coded performance scores (green ≥90, amber ≥50, red below), a metric grid for Core Web Vitals, and a short opportunities list.

### Demo

- **Live:** https://website-page-speed-report.vercel.app
- Enter any public URL → **Analyze** → desktop/mobile scores, Core Web Vitals, and top opportunities

Deploy to Vercel:

```bash
npx vercel --prod
```

Set `PAGESPEED_KEY` in the Vercel project settings. Static UI is served from `public/` via `api/index.ts`; the PageSpeed API runs as a serverless function at `/api/pagespeed`.

### HTTP API

```bash
curl "http://localhost:3000/api/pagespeed?url=https://example.com"
```

### CLI (sitemap report)

```bash
npm run report
```

Reads `TARGET_WEBSITE/sitemap.xml`, runs PageSpeed for each URL (desktop + mobile), and writes `report.json`. Waits 60 seconds between URLs to respect API rate limits.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start NestJS in watch mode (API + static UI) |
| `npm run build` | Compile TypeScript |
| `npm test` | Run Jest unit tests (no live API calls) |
| `npm run report` | Build and generate `report.json` from sitemap |

## Project layout

```text
api/
├── index.ts          # Serves public/ on Vercel
└── pagespeed.ts      # Vercel serverless handler
public/               # Demo web UI (index.html, app.js, styles.css)
src/
├── pagespeed/        # NestJS PageSpeed module
├── app.module.ts
├── main.ts           # HTTP server
└── cli.ts            # Sitemap report CLI
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAGESPEED_KEY` | Yes | Google PageSpeed Insights API key |
| `TARGET_WEBSITE` | CLI only | Site root used to fetch `/sitemap.xml` |
| `REPORT_PATH` | No | Output path for CLI report (default: `report.json`) |
| `PORT` | No | Local HTTP port (default: `3000`) |

## Output

`report.json` contains per-URL desktop/mobile scores, core metrics, and improvement opportunities.

## License

MIT © 2026 [piyushm.dev](https://piyushm.dev)
