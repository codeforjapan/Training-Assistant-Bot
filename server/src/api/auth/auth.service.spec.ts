import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;

  const UsersRepository = {
    provide: getRepositoryToken(User),
    useFactory: () => ({}),
  };
  const ConfigServiceProvider = {
    provide: ConfigService,
    useFactory: () => ({}),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersRepository, ConfigServiceProvider],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
