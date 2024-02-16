import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LineModule } from './bot/line.module';
import * as passport from 'passport';
import helmet from 'helmet';
import { CsrfMiddleware } from '../core/middleware/csrf.middleware';
import { AuthModule } from './auth/auth.module';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { RedisService } from '@songkeys/nestjs-redis';
import { ReportsModule } from './reports/reports.module';
import { ProjectsModule } from './projects/projects.module';
import { SettingsModule } from './settings/settings.module';
import { ScenarioTemplatesModule } from './scenario-templates/scenario-templates.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { GroupsModule } from './groups/groups.module';
import { ScenarioTasksModule } from './scenario-tasks/scenario-tasks.module';

@Module({
  imports: [
    LineModule,
    AuthModule,
    UsersModule,
    ReportsModule,
    ProjectsModule,
    SettingsModule,
    ScenariosModule,
    ScenarioTemplatesModule,
    GroupsModule,
    ScenarioTasksModule,
  ],
})
export class ApiModule implements NestModule {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}
  configure(consumer: MiddlewareConsumer) {
    const redisClient = this.redisService.getClient('session');
    const store = new RedisStore({
      client: redisClient,
      ttl: this.configService.get<number>('sessionTimeout'),
    });
    consumer
      .apply(
        CsrfMiddleware,
        session({
          name: this.configService.get<string>('sessionNamePrefix') + '.sid',
          secret: this.configService.get<string>('sessionSecret'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: this.configService.get<boolean>('isProduction'),
          },
          store,
        }),
        helmet(),
        passport.initialize(),
        passport.session(),
      )
      .exclude('line')
      .forRoutes('*');
  }
}
