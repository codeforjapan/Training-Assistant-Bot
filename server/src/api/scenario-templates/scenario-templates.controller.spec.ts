import { Test, TestingModule } from '@nestjs/testing';
import { ScenarioTemplatesController } from './scenario-templates.controller';
import { hasRoles, isGuarded } from '../../../test/utils';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ScenarioTemplatesService } from './scenario-templates.service';

describe('ScenarioTemplatesController', () => {
  let controller: ScenarioTemplatesController;

  const ScenarioTemplatesServiceProvider = {
    provide: ScenarioTemplatesService,
    useFactory: () => ({
      list: jest.fn(() => []),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScenarioTemplatesController],
      providers: [ScenarioTemplatesServiceProvider],
    }).compile();

    controller = module.get<ScenarioTemplatesController>(
      ScenarioTemplatesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(ScenarioTemplatesController, AuthenticatedGuard)).toBe(
      true,
    );
    expect(isGuarded(ScenarioTemplatesController, RolesGuard)).toBe(true);
    expect(hasRoles(ScenarioTemplatesController, 'Admin')).toBe(true);
  });
});
