import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { hasRoles, isGuarded } from '../../../test/utils';
import { RolesGuard } from '../../core/guards/roles.guard';

describe('GroupsController', () => {
  let controller: GroupsController;

  const GroupsServiceProvider = {
    provide: GroupsService,
    useFactory: () => ({
      list: jest.fn(() => []),
      show: jest.fn(() => ({})),
      create: jest.fn(() => ({})),
      update: jest.fn(() => ({})),
      delete: jest.fn(() => ({})),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [GroupsServiceProvider],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(GroupsController, AuthenticatedGuard)).toBe(true);
    expect(isGuarded(GroupsController, RolesGuard)).toBe(true);
    expect(hasRoles(GroupsController, 'Admin')).toBe(true);
  });
});
