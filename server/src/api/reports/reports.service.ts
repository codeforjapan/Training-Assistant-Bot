import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from '../../entities/report.entity';
import { Repository } from 'typeorm';
import { ReportImage } from '../../entities/report-image.entity';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { UtilService } from '../../core/util/util.service';
import { ExportService } from './export.service';
import { ReadStream } from 'fs';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    private readonly utilService: UtilService,
  ) {}

  async getImage(
    id: number,
    type: 'thumbnail' | 'original',
  ): Promise<ReadStream> {
    const report = await this.findReport(id);
    if (!report.img) {
      throw new NotFoundException();
    }

    const filePath = join(type, report.img);
    try {
      return await this.utilService.getFileAsStream(filePath);
    } catch (e) {
      this.logger.warn(`Image is not found: ${filePath}`);
      throw new NotFoundException();
    }
  }

  async delete(id: number): Promise<void> {
    const report = await this.findReport(id);
    if (report.img) {
      await this.utilService.removeImage(report.img);
    }
    await this.reportsRepository.remove(report);
  }

  private async findReport(id: number): Promise<Report> {
    const report = await this.reportsRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException();
    }
    return report;
  }
}
