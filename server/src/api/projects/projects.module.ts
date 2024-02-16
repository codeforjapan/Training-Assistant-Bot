import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { ProjectMembersConfirmation } from '../../entities/project-members-confirmation.entity';
import { ProjectMembersGender } from '../../entities/project-members-gender.entity';
import { ProjectMembersGeneration } from '../../entities/project-members-generation.entity';
import { Scenario } from '../../entities/scenario.entity';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { ScenarioTemplate } from '../../entities/scenario-template.entity';
import { Report } from '../../entities/report.entity';
import { UtilModule } from '../../core/util/util.module';
import { ProjectMember } from '../../entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectMember,
      ProjectMembersConfirmation,
      ProjectMembersGender,
      ProjectMembersGeneration,
      Scenario,
      ScenarioTask,
      ScenarioTemplate,
      Report,
    ]),
    UtilModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
