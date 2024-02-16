import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { Group } from '../../entities/group.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

describe('GroupsService', () => {
  let service: GroupsService;

  const GroupsRepository = {
    provide: getRepositoryToken(Group),
    useFactory: () => ({}),
  };
  const UsersRepository = {
    provide: getRepositoryToken(User),
    useFactory: () => ({}),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupsService, GroupsRepository, UsersRepository],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
