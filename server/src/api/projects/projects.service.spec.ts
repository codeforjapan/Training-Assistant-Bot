import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { Project } from '../../entities/project.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProjectMember } from '../../entities/project-member.entity';
import { ProjectMembersConfirmation } from '../../entities/project-members-confirmation.entity';
import { ProjectMembersGender } from '../../entities/project-members-gender.entity';
import { ProjectMembersGeneration } from '../../entities/project-members-generation.entity';
import { Scenario } from '../../entities/scenario.entity';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { ScenarioTemplate } from '../../entities/scenario-template.entity';
import { Report } from '../../entities/report.entity';
import { UtilService } from '../../core/util/util.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const ProjectsRepository = {
    provide: getRepositoryToken(Project),
    useFactory: () => ({}),
  };
  const ProjectMembersRepository = {
    provide: getRepositoryToken(ProjectMember),
    useFactory: () => ({}),
  };
  const ProjectMembersConfirmationRepository = {
    provide: getRepositoryToken(ProjectMembersConfirmation),
    useFactory: () => ({}),
  };
  const ProjectMembersGenderRepository = {
    provide: getRepositoryToken(ProjectMembersGender),
    useFactory: () => ({}),
  };
  const ProjectMembersGenerationRepository = {
    provide: getRepositoryToken(ProjectMembersGeneration),
    useFactory: () => ({}),
  };
  const ScenariosRepository = {
    provide: getRepositoryToken(Scenario),
    useFactory: () => ({}),
  };
  const ScenarioTasksRepository = {
    provide: getRepositoryToken(ScenarioTask),
    useFactory: () => ({}),
  };
  const ScenarioTemplatesRepository = {
    provide: getRepositoryToken(ScenarioTemplate),
    useFactory: () => ({}),
  };
  const ReportsRepository = {
    provide: getRepositoryToken(Report),
    useFactory: () => ({}),
  };
  const UtilServiceProvider = {
    provide: UtilService,
    useFactory: () => ({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        ProjectsRepository,
        ProjectMembersRepository,
        ProjectMembersConfirmationRepository,
        ProjectMembersGenderRepository,
        ProjectMembersGenerationRepository,
        ScenariosRepository,
        ScenarioTasksRepository,
        ScenarioTemplatesRepository,
        ReportsRepository,
        UtilServiceProvider,
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
