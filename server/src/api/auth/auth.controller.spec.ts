import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppLogger } from '../../core/logger/app-logger.service';

describe('AuthController', () => {
  let controller: AuthController;

  const AuthServiceProvider = {
    provide: AuthService,
    useFactory: () => ({
      validateUser: jest.fn(() => ({})),
      changePassword: jest.fn(() => ({})),
      generateRememberMeToken: jest.fn(() => ({})),
      isValidRememberToken: jest.fn(() => ({})),
    }),
  };
  const LoggerProvider = {
    provide: AppLogger,
    useFactory: () => ({
      log: jest.fn(() => ({})),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthServiceProvider, LoggerProvider],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
