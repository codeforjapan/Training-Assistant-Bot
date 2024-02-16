import { Test, TestingModule } from '@nestjs/testing';
import { ScenarioTemplatesService } from './scenario-templates.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ScenarioTemplate } from '../../entities/scenario-template.entity';

describe('ScenarioTemplatesService', () => {
  let service: ScenarioTemplatesService;

  const ScenarioTemplatesRepository = {
    provide: getRepositoryToken(ScenarioTemplate),
    useFactory: () => ({
      find: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScenarioTemplatesService, ScenarioTemplatesRepository],
    }).compile();

    service = module.get<ScenarioTemplatesService>(ScenarioTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
