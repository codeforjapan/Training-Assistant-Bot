import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebhookRequestBody } from '@line/bot-sdk';
import { AccountService } from './account.service';
import { ReportService } from './report.service';
import { RedisService } from '@songkeys/nestjs-redis';
import { LineService } from '../core/util/line.service';
import { ProjectService } from './project.service';
import { QuestionnaireService } from './questionnaire.service';
import { TaskService } from '../core/util/task.service';
import { AppLogger } from '../core/logger/app-logger.service';

type LineEvent = {
  body: WebhookRequestBody;
};

export type CurrentTaskStatus = {
  type: string;
  data?: any;
  updatedAt?: Date;
};

@Injectable()
export class BotService {
  private readonly logger: Logger = new Logger(BotService.name);
  constructor(
    private readonly accountService: AccountService,
    private readonly reportService: ReportService,
    private readonly redisService: RedisService,
    private readonly lineService: LineService,
    private readonly projectService: ProjectService,
    private readonly questionnaireService: QuestionnaireService,
    private readonly taskService: TaskService,
    private readonly appLogger: AppLogger,
  ) {}

  @OnEvent('lineEvent', { async: true })
  async handleLineEvent(payload: LineEvent) {
    try {
      const { body } = payload;
      const taskClient = this.redisService.getClient('task');

      for (const [, event] of body.events.entries()) {
        if (!event.source.userId) {
          return;
        }

        if (event.type === 'follow') {
          await this.accountService.register(event.source.userId);
        } else if (event.type === 'unfollow') {
          await this.accountService.unregister(event.source.userId);
        } else {
          let user = await this.accountService.getUserFromLineUser(
            event.source.userId,
          );
          if (!user) {
            user = await this.accountService.register(event.source.userId);
          } else if (user.isBlocked) {
            this.appLogger.log({
              level: 'info',
              userId: user.id,
              function: 'bot.handleLineEvent',
              message: `User is blocked: ${user.name}`,
            });
            return;
          }

          const currentTaskStr = await taskClient.get(event.source.userId);
          const currentTask: CurrentTaskStatus = currentTaskStr
            ? JSON.parse(currentTaskStr)
            : { type: 'report' };

          if (event.type === 'postback') {
            const postbackData = this.lineService.parsePostbackData(
              event.postback.data,
            );
            if (postbackData.projectId) {
              if (postbackData.action === 'join') {
                await this.projectService.joinProject(
                  postbackData.projectId,
                  user,
                );
              } else if (postbackData.action === 'ques') {
                await this.questionnaireService.handleQuestionnaire(
                  postbackData,
                  user,
                );
              } else if (postbackData.action === 'report') {
                await this.reportService.reportWithPostback(
                  event,
                  user,
                  currentTask,
                );
              }
              await this.taskService.executeNextTask(
                event.replyToken,
                postbackData.scenarioTaskId,
                postbackData.index,
                postbackData.projectId,
              );
              return;
            }
          }

          if (currentTask.type === 'report') {
            if (event.type === 'message' || event.type === 'postback') {
              await this.reportService.report(event, currentTask, user);
            }
          }
        }
      }
    } catch (e) {
      this.logger.error(e.message, e.stack);
    }
  }
}
