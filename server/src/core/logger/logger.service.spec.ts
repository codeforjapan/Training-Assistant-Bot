import { Test, TestingModule } from '@nestjs/testing';
import { AppLogger } from './app-logger.service';
import { ConfigService } from '@nestjs/config';

describe('LoggerService', () => {
  let service: AppLogger;

  const ConfigServiceProvider = {
    provide: ConfigService,
    useFactory: () => ({
      get: jest.fn(),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppLogger, ConfigServiceProvider],
    }).compile();

    service = module.get<AppLogger>(AppLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
