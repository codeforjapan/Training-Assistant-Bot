import {
  WinstonModuleOptions,
  WinstonModuleOptionsFactory,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonConfigService implements WinstonModuleOptionsFactory {
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = this.configService.get<boolean>('isProduction');
  }
  createWinstonModuleOptions():
    | Promise<WinstonModuleOptions>
    | WinstonModuleOptions {
    return {
      format: this.getLogFormat(),
      transports: this.getTransports(),
    };
  }

  private getLogFormat() {
    const { combine, timestamp, json, ms } = winston.format;
    return this.isProduction
      ? combine(timestamp(), json())
      : combine(
          timestamp(),
          ms(),
          nestWinstonModuleUtilities.format.nestLike('KobeBotLab', {
            colors: true,
            prettyPrint: true,
          }),
        );
  }

  private getTransports() {
    const transports: winston.transport[] = [];
    if (this.isProduction) {
      const systemTransport = new DailyRotateFile({
        filename: 'system-%DATE%.log',
        symlinkName: 'system.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        dirname: 'logs',
        createSymlink: true,
        json: true,
      });
      transports.push(...[systemTransport]);
    } else {
      transports.push(new winston.transports.Console());
    }
    return transports;
  }
}
