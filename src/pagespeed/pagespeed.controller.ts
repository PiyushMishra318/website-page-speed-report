import { Controller, Get, Query } from '@nestjs/common';
import { PagespeedService } from './pagespeed.service';

@Controller('api/pagespeed')
export class PagespeedController {
  constructor(private readonly pagespeedService: PagespeedService) {}

  @Get()
  analyze(@Query('url') url: string) {
    return this.pagespeedService.analyzeUrl(url);
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
