import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { MulterModule } from '@nestjs/platform-express';
import { DatabaseModule } from './database.module';
import configuration, {
  validationSchema as coreValidationSchema,
} from '../config/configuration';
import {
  ormConfig,
  validationSchema as databaseValidationSchema,
} from '../config/orm.config';
import redisConfig, {
  validationSchema as redisValidationSchema,
} from '../config/redis.config';
import appConfig, {
  validationSchema as appValidationSchema,
} from '../config/app.config';
import lineConfig, {
  validationSchema as lineValidationSchema,
} from '../config/line.config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppLoggerModule } from './logger/app-logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from './events/events.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        ...coreValidationSchema,
        ...databaseValidationSchema,
        ...redisValidationSchema,
        ...appValidationSchema,
        ...lineValidationSchema,
      }),
      envFilePath: '.env',
      load: [configuration, redisConfig, appConfig, ormConfig, lineConfig],
    }),
    DatabaseModule,
    MulterModule.registerAsync({
      useFactory(configService: ConfigService) {
        return {
          dest: configService.get('app.tmpFilePath'),
        };
      },
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    AppLoggerModule,
    ScheduleModule.forRoot(),
    EventsModule,
  ],
  exports: [ConfigModule, DatabaseModule, MulterModule],
})
export class CoreModule {}
