import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { Report } from '../../entities/report.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UtilService } from '../../core/util/util.service';

describe('ReportsService', () => {
  let service: ReportsService;

  const ReportsRepository = {
    provide: getRepositoryToken(Report),
    useFactory: () => ({}),
  };
  const UtilServiceProvider = {
    provide: UtilService,
    useFactory: () => ({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, ReportsRepository, UtilServiceProvider],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
