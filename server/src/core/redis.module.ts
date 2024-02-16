import { DynamicModule } from '@nestjs/common';
import { RedisModule as NestJsRedisModule } from '@songkeys/nestjs-redis';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../config/redis.config';

export const RedisModule: DynamicModule = NestJsRedisModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const redisConfig = config.get<RedisConfig>('redis');
    if (!redisConfig) {
      throw new Error('Not found redis config');
    }
    return {
      config: [
        {
          namespace: 'session',
          host: redisConfig.host,
          port: redisConfig.port,
          db: 0,
        },
        {
          namespace: 'task',
          host: redisConfig.host,
          port: redisConfig.port,
          db: 1,
        },
      ],
    };
  },
});
