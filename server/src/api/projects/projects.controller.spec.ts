import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { hasRoles, isGuarded } from '../../../test/utils';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  const ProjectsServiceProvider = {
    provide: ProjectsService,
    useFactory: () => ({
      list: jest.fn(() => []),
      show: jest.fn(() => ({})),
      getStatistic: jest.fn(() => ({})),
      getReports: jest.fn(() => ({})),
      getScenario: jest.fn(() => ({})),
      create: jest.fn(() => ({})),
      resetConfirmation: jest.fn(() => ({})),
      delete: jest.fn(() => ({})),
      exportAsZip: jest.fn(() => ({})),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [ProjectsServiceProvider],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(ProjectsController, AuthenticatedGuard)).toBe(true);
    expect(isGuarded(ProjectsController, RolesGuard)).toBe(true);
    expect(hasRoles(ProjectsController, 'Admin')).toBe(true);
  });
});
