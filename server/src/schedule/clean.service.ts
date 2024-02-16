import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { readdir, rm, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class CleanService {
  private readonly logger = new Logger(CleanService.name);

  constructor(private readonly configService: ConfigService) {}
  @Cron('0 10 2 * * *', { timeZone: 'Asia/Tokyo' })
  async handleCron() {
    this.logger.log('Start cleaning');
    const tmpFilePath = this.configService.get<string>('app.tmpFilePath');
    if (!existsSync(tmpFilePath)) {
      this.logger.log('Finish cleaning');
      return;
    }
    const files = await readdir(tmpFilePath, { withFileTypes: true });
    this.logger.log(`Found ${files.length} files`);
    for (const file of files) {
      try {
        const info = await stat(join(tmpFilePath, file.name));
        if (Date.now() - info.birthtimeMs > 360 * 1000) {
          this.logger.log(`Delete: ${file.name}`);
          if (file.isFile()) {
            await rm(join(tmpFilePath, file.name));
          } else if (file.isDirectory()) {
            await rm(join(tmpFilePath, file.name), { recursive: true });
          }
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
    this.logger.log('Finish cleaning');
  }
}
