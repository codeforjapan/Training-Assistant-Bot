import { Test, TestingModule } from '@nestjs/testing';
import { ScenarioTasksService } from './scenario-tasks.service';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Scenario } from '../../entities/scenario.entity';

describe('ScenarioTasksService', () => {
  let service: ScenarioTasksService;

  const ScenarioTasksRepository = {
    provide: getRepositoryToken(ScenarioTask),
    useFactory: () => ({}),
  };
  const ScenariosRepository = {
    provide: getRepositoryToken(Scenario),
    useFactory: () => ({}),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenarioTasksService,
        ScenariosRepository,
        ScenarioTasksRepository,
      ],
    }).compile();

    service = module.get<ScenarioTasksService>(ScenarioTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
