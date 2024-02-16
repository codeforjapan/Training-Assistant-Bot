import { Test, TestingModule } from '@nestjs/testing';
import { UtilService } from './util.service';
import { ConfigService } from '@nestjs/config';

describe('UtilService', () => {
  let service: UtilService;

  const ConfigServiceProvider = {
    provide: ConfigService,
    useFactory: () => ({
      get: jest.fn(),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilService, ConfigServiceProvider],
    }).compile();

    service = module.get<UtilService>(UtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
