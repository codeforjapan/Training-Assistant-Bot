import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Setting } from '../../entities/setting.entity';

describe('SettingsService', () => {
  let service: SettingsService;

  const SettingsRepository = {
    provide: getRepositoryToken(Setting),
    useFactory: () => ({
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService, SettingsRepository],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
