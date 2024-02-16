import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { hasRoles, isGuarded } from '../../../test/utils';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const UsersServiceProvider = {
    provide: UsersService,
    useFactory: () => ({
      list: jest.fn(() => []),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersServiceProvider],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AuthenticatedGuard and RolesGuard', () => {
    expect(isGuarded(UsersController, AuthenticatedGuard)).toBe(true);
    expect(isGuarded(UsersController, RolesGuard)).toBe(true);
    expect(hasRoles(UsersController, 'Admin')).toBe(true);
  });
});
