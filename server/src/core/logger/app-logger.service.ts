import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston/dist/winston.utilities';

export interface ApplicationLogFormat {
  userId?: number;
  function: string;
  message: string;
  level: 'error' | 'warn' | 'info';
}

@Injectable()
export class AppLogger {
  private readonly logger: winston.Logger;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<boolean>('isProduction');
    this.logger = winston.createLogger({
      format: this.getLogFormat(),
      transports: this.getTransports(),
      levels: {
        error: 0,
        warn: 1,
        info: 2,
      },
    });
  }

  log(message: ApplicationLogFormat) {
    this.logger.log(this.formatMessage(message));
  }

  private formatMessage(message: ApplicationLogFormat) {
    message.userId = message.userId ?? -1;
    return message;
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
      const transport = new DailyRotateFile({
        filename: 'application-%DATE%.log',
        symlinkName: 'application.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        dirname: 'logs',
        createSymlink: true,
        json: true,
      });
      transports.push(...[transport]);
    } else {
      transports.push(new winston.transports.Console());
    }
    return transports;
  }
}
