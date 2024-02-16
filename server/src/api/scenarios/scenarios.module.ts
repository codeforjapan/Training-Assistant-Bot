import { Module } from '@nestjs/common';
import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { Scenario } from '../../entities/scenario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { Group } from '../../entities/group.entity';
import { LineUser } from '../../entities/line-user.entity';
import { Project } from '../../entities/project.entity';
import { UtilModule } from '../../core/util/util.module';
import { ProjectMember } from '../../entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Scenario,
      ScenarioTask,
      Group,
      LineUser,
      Project,
      ProjectMember,
    ]),
    UtilModule,
  ],
  controllers: [ScenariosController],
  providers: [ScenariosService],
})
export class ScenariosModule {}
