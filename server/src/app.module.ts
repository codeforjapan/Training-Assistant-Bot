import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { RedisModule } from './core/redis.module';
import { ApiModule } from './api/api.modules';
import { ScheduleModule } from './schedule/shcedule.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [CoreModule, RedisModule, ApiModule, ScheduleModule, BotModule],
})
export class AppModule {}
