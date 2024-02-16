import { Injectable, Logger } from '@nestjs/common';
import { Report } from '../../entities/report.entity';
import { createReadStream, existsSync, mkdirSync, ReadStream } from 'fs';
import { copyFile, stat as fsStat, rm } from 'fs/promises';
import { execSync } from 'child_process';
import { join } from 'path';
import * as XLSX from 'xlsx';
import { UtilService } from '../../core/util/util.service';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExportService {
  constructor(
    private readonly utilService: UtilService,
    private readonly configService: ConfigService,
  ) {}

  async export(reports: Report[]): Promise<string> {
    const folderName = `export_${Date.now()}`;
    const tmpFilePath = this.configService.get<string>('app.tmpFilePath');
    const exportWorkingPath = join(tmpFilePath, folderName);
    if (existsSync(exportWorkingPath)) {
      return this.export(reports);
    }
    mkdirSync(join(tmpFilePath, folderName, 'images'), { recursive: true });
    await Promise.all([
      this.prepareImages(reports, join(exportWorkingPath, 'images')),
      this.createExcel(reports, exportWorkingPath),
    ]).catch((e) => {
      Logger.error(e);
    });

    execSync(`zip ../${folderName} -r ./*`, { cwd: exportWorkingPath });
    await rm(join(tmpFilePath, folderName), { recursive: true });
    return `${folderName}.zip`;
  }

  private async prepareImages(
    reports: Report[],
    exportFolderPath: string,
  ): Promise<void> {
    const basePath = this.utilService.getFileStorePath();
    const tasks = [];
    reports.forEach((report) => {
      report.reportImages?.forEach((reportImage) => {
        const imgPath = join(basePath, 'original', reportImage.file);
        tasks.push(copyFile(imgPath, join(exportFolderPath, reportImage.file)));
      });
    });
    await Promise.all(tasks);
  }

  private async createExcel(reports: Report[], exportFolderPath: string) {
    let maxImageLength = 0;
    reports.forEach((report) => {
      maxImageLength = Math.max(maxImageLength, report.reportImages.length);
    });
    const wb = XLSX.utils.book_new();
    const keyVal = [
      { key: '災害No.', value: 'dbNumber' },
      { key: '箇所名', value: 'locationName' },
      { key: '住所', value: 'locationAddress' },
      { key: '報告日時', value: 'reportedAt' },
      { key: '災害種別', value: 'disasterType' },
      { key: '事象', value: 'phenomenonType' },
      { key: '施設種別', value: 'facilityType' },
      { key: '災害情報詳細', value: 'message' },
      { key: '対応状況', value: 'status' },
      { key: '対応状況詳細', value: 'statusNote' },
      { key: '孤立集落状況', value: 'townStatus' },
      { key: '完了日時', value: 'finishedAt' },
      { key: '緯度', value: 'location.lat' },
      { key: '経度', value: 'location.lon' },
    ];
    for (let i = 0; i < maxImageLength; i++) {
      keyVal.push({ key: `画像${i + 1}`, value: `img${i}` });
    }
    const data = reports.map((report) => {
      const tmp: any = {};
      keyVal.forEach(({ key, value }) => {
        if (value === 'location.lon') {
          tmp[key] = report.geom ? report.geom.coordinates[0] : undefined;
        } else if (value === 'location.lat') {
          tmp[key] = report.geom ? report.geom.coordinates[1] : undefined;
        } else if (value === 'reportedAt' || value === 'finishedAt') {
          tmp[key] = report[value]
            ? DateTime.fromJSDate(report[value]).toFormat('yyyy/LL/dd HH:mm')
            : undefined;
        } else if (value.startsWith('img')) {
          const idx = Number(value.replace('img', ''));
          tmp[key] = report.reportImages[idx]
            ? report.reportImages[idx].file
            : '';
        } else {
          tmp[key] = report[value];
        }
      });
      return tmp;
    });
    const header = keyVal.map((k) => k.key);
    const ws = XLSX.utils.json_to_sheet(data, { header });
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, join(exportFolderPath, 'reports.xlsx'));
    return true;
  }

  async getExportedFile(fileName: string): Promise<ReadStream> {
    const fullFilePath = join(
      this.configService.get<string>('app.tmpFilePath'),
      fileName,
    );
    const stat = await fsStat(fullFilePath);
    if (stat.isFile()) {
      return createReadStream(fullFilePath);
    }
    throw new Error(`Not exported file: ${fullFilePath}`);
  }
}
