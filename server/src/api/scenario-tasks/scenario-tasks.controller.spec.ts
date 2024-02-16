import { Test, TestingModule } from '@nestjs/testing';
import { ScenarioTasksController } from './scenario-tasks.controller';
import { hasRoles, isGuarded } from '../../../test/utils';
import { ScenariosController } from '../scenarios/scenarios.controller';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ScenarioTasksService } from './scenario-tasks.service';

describe('ScenarioTasksController', () => {
  let controller: ScenarioTasksController;

  const ScenarioTasksServiceProvider = {
    provide: ScenarioTasksService,
    useFactory: () => ({
      show: jest.fn(() => ({})),
      create: jest.fn(() => ({})),
      update: jest.fn(() => ({})),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScenarioTasksController],
      providers: [ScenarioTasksServiceProvider],
    }).compile();

    controller = module.get<ScenarioTasksController>(ScenarioTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(ScenarioTasksController, AuthenticatedGuard)).toBe(true);
    expect(isGuarded(ScenarioTasksController, RolesGuard)).toBe(true);
    expect(hasRoles(ScenarioTasksController, 'Admin')).toBe(true);
  });
});
