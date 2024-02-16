import { Test, TestingModule } from '@nestjs/testing';
import { BotService } from './bot.service';
import { AccountService } from './account.service';
import { ReportService } from './report.service';
import { RedisService } from '@songkeys/nestjs-redis';
import { LineService } from '../core/util/line.service';
import { AppLogger } from '../core/logger/app-logger.service';
import { ProjectService } from './project.service';
import { QuestionnaireService } from './questionnaire.service';
import { TaskService } from '../core/util/task.service';

describe('BotService', () => {
  let service: BotService;

  const AccountServiceProvider = {
    provide: AccountService,
    useFactory: () => ({}),
  };
  const ReportServiceProvider = {
    provide: ReportService,
    useFactory: () => ({}),
  };
  const RedisServiceProvider = {
    provide: RedisService,
    useFactory: () => ({}),
  };
  const LineServiceProvider = {
    provide: LineService,
    useFactory: () => ({}),
  };
  const ProjectServiceProvider = {
    provide: ProjectService,
    useFactory: () => ({}),
  };
  const QuestionnaireServiceProvider = {
    provide: QuestionnaireService,
    useFactory: () => ({}),
  };
  const TaskServiceProvider = {
    provide: TaskService,
    useFactory: () => ({}),
  };
  const AppLoggerProvider = {
    provide: AppLogger,
    useFactory: () => ({}),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BotService,
        AccountServiceProvider,
        ReportServiceProvider,
        RedisServiceProvider,
        LineServiceProvider,
        ProjectServiceProvider,
        QuestionnaireServiceProvider,
        TaskServiceProvider,
        AppLoggerProvider,
      ],
    }).compile();

    service = module.get<BotService>(BotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
