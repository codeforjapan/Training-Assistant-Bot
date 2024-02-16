import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserWithLineUser } from '../../entities/user_with_line_user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersService', () => {
  let service: UsersService;

  const UserWithLineUserRepository = {
    provide: getRepositoryToken(UserWithLineUser),
    useFactory: () => ({
      find: jest.fn(),
    }),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UserWithLineUserRepository],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
