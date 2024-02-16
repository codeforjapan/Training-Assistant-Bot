import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { hasRoles, isGuarded } from '../../../test/utils';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let controller: SettingsController;

  const SettingsServiceProvider = {
    provide: SettingsService,
    useFactory: () => ({
      list: jest.fn(() => []),
      update: jest.fn(() => ({})),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [SettingsServiceProvider],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(SettingsController, AuthenticatedGuard)).toBe(true);
    expect(isGuarded(SettingsController, RolesGuard)).toBe(true);
    expect(hasRoles(SettingsController, 'Admin')).toBe(true);
  });
});
