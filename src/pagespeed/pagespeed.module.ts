import { Module } from '@nestjs/common';
import { PagespeedController } from './pagespeed.controller';
import { PagespeedService } from './pagespeed.service';

@Module({
  controllers: [PagespeedController],
  providers: [PagespeedService],
  exports: [PagespeedService],
})
export class PagespeedModule {}
