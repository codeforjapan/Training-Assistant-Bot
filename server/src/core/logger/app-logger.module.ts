import { Global, Module } from '@nestjs/common';
import { AppLogger } from './app-logger.service';
import { WinstonConfigService } from './winston-config.service';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useClass: WinstonConfigService,
      inject: [ConfigService],
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppLoggerModule {}
