import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { hasRoles, isGuarded } from '../../../test/utils';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;

  const ReportsServiceProvider = {
    provide: ReportsService,
    useFactory: () => ({
      getImage: jest.fn(() => ({})),
      delete: jest.fn(() => ({})),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [ReportsServiceProvider],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(ReportsController, AuthenticatedGuard)).toBe(true);
    expect(isGuarded(ReportsController, RolesGuard)).toBe(true);
    expect(hasRoles(ReportsController, 'Admin')).toBe(true);
  });
});
