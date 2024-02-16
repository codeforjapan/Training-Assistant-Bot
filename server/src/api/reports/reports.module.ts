import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from '../../entities/report.entity';
import { ReportImage } from '../../entities/report-image.entity';
import { UtilModule } from '../../core/util/util.module';
import { ExportService } from './export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportImage]), UtilModule],
  controllers: [ReportsController],
  providers: [ReportsService, ExportService],
})
export class ReportsModule {}
