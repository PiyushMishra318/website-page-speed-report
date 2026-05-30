import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { defaultOutputPath, PagespeedService } from './pagespeed/pagespeed.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(PagespeedService);

  const website = process.env.TARGET_WEBSITE ?? 'https://www.example.com';
  const startTime = Date.now();
  const report = await service.buildReport(website);
  const output = process.env.REPORT_PATH ?? defaultOutputPath();
  service.writeReport(output, report);

  const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
  console.log(`Report written to ${output} in ${elapsedMinutes.toFixed(1)} minutes`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
