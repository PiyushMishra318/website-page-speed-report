import * as path from 'path';
import * as dotenv from 'dotenv';
import { defaultOutputPath, PageSpeedReportService } from './report.service';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  const website = process.env.TARGET_WEBSITE ?? 'https://www.centreforsight.net';
  const apiKey = process.env.PAGESPEED_KEY;

  if (!apiKey) {
    console.error('PAGESPEED_KEY is required in .env');
    process.exit(1);
  }

  const startTime = Date.now();
  const service = new PageSpeedReportService(apiKey);
  const report = await service.buildReport(website);
  const output = process.env.REPORT_PATH ?? defaultOutputPath();
  service.writeReport(output, report);

  const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
  console.log(`Report written to ${output} in ${elapsedMinutes.toFixed(1)} minutes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
