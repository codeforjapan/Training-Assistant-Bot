import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  ReadStream,
} from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { stat as fsStat } from 'fs/promises';
import { PassThrough, Readable } from 'stream';
import * as sharp from 'sharp';

@Injectable()
export class UtilService {
  constructor(private readonly configService: ConfigService) {}

  getValidSorts(
    sortableColumns: string[],
    sorts: string[],
  ): { column: string; order: 'ASC' | 'DESC' }[] {
    const validSorts = [];
    sorts.forEach((s) => {
      const [column, order] = s.split(':');
      if (!sortableColumns.includes(column)) {
        throw new BadRequestException({
          error: 'INVALID_SORT_COLUMN',
          message: `"${column}" is invalid`,
        });
      }
      if (order !== 'asc' && order !== 'desc') {
        throw new BadRequestException({
          error: 'INVALID_SORT_ORDER',
          message: `"${order}" is invalid`,
        });
      }
      const orderUpper = order === 'asc' ? 'ASC' : 'DESC';
      validSorts.push({ column, order: orderUpper });
    });
    return validSorts;
  }

  getFileStorePath(): string {
    return this.configService.get<string>('app.fileStorePath', '/data');
  }

  async getFileAsStream(filePath: string): Promise<ReadStream> {
    const basePath = this.getFileStorePath();
    const fullFilePath = join(basePath, filePath);
    const stat = await fsStat(fullFilePath);
    if (stat.isFile()) {
      return createReadStream(fullFilePath);
    }
    throw new Error(`This is directory: ${fullFilePath}`);
  }

  async saveImage(file: { filename: string; path: string }): Promise<string> {
    const stream = createReadStream(file.path);
    return this.saveImgWithStream(stream);
  }

  async saveImgWithStream(stream: Readable): Promise<string> {
    const fileName = `${Date.now()}.jpg`;
    const basePath = this.getFileStorePath();
    const originalDirPath = join(basePath, 'original');
    const thumbnailDirPath = join(basePath, 'thumbnail');
    if (
      existsSync(join(originalDirPath, fileName)) ||
      existsSync(join(thumbnailDirPath, fileName))
    ) {
      return this.saveImgWithStream(stream);
    }

    const originalDest = createWriteStream(join(originalDirPath, fileName));
    const thumbnailDest = createWriteStream(join(thumbnailDirPath, fileName));
    const path = new PassThrough();
    stream.pipe(path);
    await Promise.all([
      new Promise((resolve, reject) => {
        path.pipe(sharp().jpeg()).pipe(originalDest);
        originalDest.on('finish', resolve);
        originalDest.on('error', reject);
        stream.on('error', reject);
      }),
      new Promise((resolve, reject) => {
        path
          .pipe(sharp().resize(512, 512, { fit: 'inside' }).jpeg())
          .pipe(thumbnailDest);
        thumbnailDest.on('finish', resolve);
        thumbnailDest.on('error', reject);
        stream.on('error', reject);
      }),
    ]);
    return fileName;
  }

  async removeImage(filePath: string) {
    const basePath = this.getFileStorePath();
    const originalDirPath = join(basePath, 'original');
    const thumbnailDirPath = join(basePath, 'thumbnail');
    const originalImgPath = join(originalDirPath, filePath);
    const thumbnailImgPath = join(thumbnailDirPath, filePath);
    if (existsSync(originalImgPath)) {
      await unlink(originalImgPath);
    }
    if (existsSync(thumbnailImgPath)) {
      await unlink(thumbnailImgPath);
    }
  }
}
