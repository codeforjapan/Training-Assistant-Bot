import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LineUser } from '../entities/line-user.entity';
import { User } from '../entities/user.entity';
import { ReportService } from './report.service';
import { UtilModule } from '../core/util/util.module';
import { Report } from '../entities/report.entity';
import { ReportImage } from '../entities/report-image.entity';
import { Message } from '../entities/message.entity';
import { ProjectMember } from '../entities/project-member.entity';
import { ProjectService } from './project.service';
import { Project } from '../entities/project.entity';
import { QuestionnaireService } from './questionnaire.service';
import { Scenario } from '../entities/scenario.entity';
import { ScenarioTask } from '../entities/scenario-task.entity';
import { Category } from '../entities/category.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LineUser,
      User,
      Report,
      ReportImage,
      Message,
      ProjectMember,
      Project,
      Scenario,
      ScenarioTask,
      Category,
    ]),
    UtilModule,
    HttpModule,
  ],
  providers: [
    BotService,
    AccountService,
    ReportService,
    ProjectService,
    QuestionnaireService,
  ],
})
export class BotModule {}
