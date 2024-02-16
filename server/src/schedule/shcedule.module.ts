import { Module } from '@nestjs/common';
import { CleanService } from './clean.service';

@Module({
  providers: [CleanService],
})
export class ScheduleModule {}
