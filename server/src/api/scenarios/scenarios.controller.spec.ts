import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosController } from './scenarios.controller';
import { hasRoles, isGuarded } from '../../../test/utils';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ScenariosService } from './scenarios.service';

describe('ScenariosController', () => {
  let controller: ScenariosController;

  const ScenariosServiceProvider = {
    provide: ScenariosService,
    useFactory: () => ({
      list: jest.fn(() => []),
      update: jest.fn(() => ({})),
      reset: jest.fn(() => ({})),
      sendMessage: jest.fn(() => ({})),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScenariosController],
      providers: [ScenariosServiceProvider],
    }).compile();

    controller = module.get<ScenariosController>(ScenariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(ScenariosController, AuthenticatedGuard)).toBe(true);
    expect(isGuarded(ScenariosController, RolesGuard)).toBe(true);
    expect(hasRoles(ScenariosController, 'Admin')).toBe(true);
  });
});
