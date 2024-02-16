import { Test, TestingModule } from '@nestjs/testing';
import { ScenariosService } from './scenarios.service';
import { Scenario } from '../../entities/scenario.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from '../../entities/group.entity';
import { LineUser } from '../../entities/line-user.entity';
import { Project } from '../../entities/project.entity';
import { ProjectMember } from '../../entities/project-member.entity';
import { TaskService } from '../../core/util/task.service';
import { LineService } from '../../core/util/line.service';
import { ScenarioTask } from '../../entities/scenario-task.entity';

describe('ScenariosService', () => {
  let service: ScenariosService;
  const ScenariosRepository = {
    provide: getRepositoryToken(Scenario),
    useFactory: () => ({}),
  };
  const ScenarioTasksRepository = {
    provide: getRepositoryToken(ScenarioTask),
    useFactory: () => ({}),
  };
  const GroupsRepository = {
    provide: getRepositoryToken(Group),
    useFactory: () => ({}),
  };
  const LineUsersRepository = {
    provide: getRepositoryToken(LineUser),
    useFactory: () => ({}),
  };
  const ProjectsRepository = {
    provide: getRepositoryToken(Project),
    useFactory: () => ({}),
  };
  const ProjectMembersRepository = {
    provide: getRepositoryToken(ProjectMember),
    useFactory: () => ({}),
  };
  const TaskServiceProvider = {
    provide: TaskService,
    useFactory: () => ({}),
  };
  const LiseServiceProvider = {
    provide: LineService,
    useFactory: () => ({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScenariosService,
        ScenariosRepository,
        ScenarioTasksRepository,
        GroupsRepository,
        LineUsersRepository,
        ProjectsRepository,
        ProjectMembersRepository,
        TaskServiceProvider,
        LiseServiceProvider,
      ],
    }).compile();

    service = module.get<ScenariosService>(ScenariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
