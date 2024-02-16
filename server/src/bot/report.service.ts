import { Injectable, Logger } from '@nestjs/common';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { LineUser } from '../entities/line-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import {
  Message as LINEMessage,
  PostbackEvent,
  MessageEvent,
} from '@line/bot-sdk';
import { Message } from '../entities/message.entity';
import { CurrentTaskStatus } from './bot.service';
import { RedisService } from '@songkeys/nestjs-redis';
import Redis from 'ioredis';
import { Report as ReportEntity } from '../entities/report.entity';
import { ReportImage } from '../entities/report-image.entity';
import { ConfigService } from '@nestjs/config';
import { UtilService } from '../core/util/util.service';
import { LineService } from '../core/util/line.service';
import { Project } from '../entities/project.entity';
import { ProjectMember } from '../entities/project-member.entity';
import { ProjectService } from './project.service';
import { Scenario } from '../entities/scenario.entity';
import { ScenarioTask } from '../entities/scenario-task.entity';
import { Category } from '../entities/category.entity';

interface ReportStatus {
  category: number;
  message: string;
  img: string;
  geom: { lat: number; lon: number };
  scenarioTaskId: number;
  projectId: number;
}

@Injectable()
export class ReportService {
  private readonly logger: Logger = new Logger(ReportService.name);
  private readonly redisClient: Redis;
  private defaultCategoryId: number;

  constructor(
    @InjectRepository(LineUser)
    private readonly lineUsersRepository: Repository<LineUser>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(ReportEntity)
    private readonly reportsRepository: Repository<ReportEntity>,
    @InjectRepository(ReportImage)
    private readonly reportImagesRepository: Repository<ReportImage>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
    @InjectRepository(Scenario)
    private readonly scenariosRepository: Repository<Scenario>,
    @InjectRepository(ScenarioTask)
    private readonly scenarioTasksRepository: Repository<ScenarioTask>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly utilService: UtilService,
    private readonly lineService: LineService,
    private readonly projectService: ProjectService,
  ) {
    this.redisClient = this.redisService.getClient('task');
    this.categoriesRepository
      .findOne({
        where: { name: '災害' },
      })
      .then((category) => {
        this.defaultCategoryId = category?.id || -1;
      });
  }

  async reportWithPostback(
    event: PostbackEvent,
    user: User,
    currentStatus: CurrentTaskStatus,
  ): Promise<void> {
    if (!event.source.userId) {
      return;
    }
    const report: ReportStatus = currentStatus.data
      ? currentStatus.data
      : this.getDefaultReportValues();

    if (!report.projectId || !report.scenarioTaskId) {
      await this.handleReportStart(event, report, user);
    }
    const data = this.lineService.parsePostbackData(event.postback.data).data;
    if (data.startsWith('category=')) {
      report.category = Number(data.replace('category=', ''));
    }
  }

  async handleReportStart(
    event: MessageEvent | PostbackEvent,
    report: ReportStatus,
    user: User,
  ) {
    // TODO Check remaining report
    await this.resetReport(report, event.source.userId!);
    await this.checkProject(report, user, event.replyToken);
    await this.saveReport(report, event.source.userId!, user);
  }

  async report(
    event: MessageEvent | PostbackEvent,
    currentStatus: CurrentTaskStatus,
    user: User,
  ): Promise<boolean> {
    if (!event.source.userId) {
      return false;
    }

    const report: ReportStatus = currentStatus.data
      ? currentStatus.data
      : this.getDefaultReportValues();

    if (event.type === 'message') {
      const message = event.message;
      if (
        message.type === 'text' &&
        message.text === this.configService.get<string>('line.reportKeyword')
      ) {
        await this.handleReportStart(event, report, user);
      } else {
        if (message.type === 'image') {
          const stream = await this.lineService.getMessageContent(message.id);
          const fileName = await this.utilService
            .saveImgWithStream(stream)
            .catch(console.error);
          this.setData('img', fileName, report);
        } else if (message.type === 'location') {
          this.setData(
            'geom',
            { lat: Number(message.latitude), lon: Number(message.longitude) },
            report,
          );
        } else if (!report.message && message.type === 'text') {
          this.setData('message', message.text, report);
        } else {
          return false;
        }
      }
    } else if (event.type === 'postback') {
      const [type, value] = event.postback.data
        .split('&')
        .map((keyVal) => keyVal.split('=')[1]);
      if (type === 'project') {
        await this.checkProject(report, user, event.replyToken, Number(value));
      } else if (type === 'confirm') {
        if (value === 'true') {
          await this.saveReport(report, event.source.userId, user);
          const message = await this.getLINEMessage(
            'line',
            'request-completed',
          );
          await this.lineService.replyMessage(
            event.replyToken,
            message as LINEMessage,
          );
        } else {
          await this.resetReport(report, event.source.userId);
          const message = await this.getLINEMessage('line', 'request-canceled');
          await this.lineService.replyMessage(
            event.replyToken,
            message as LINEMessage,
          );
        }
        return true;
      } else {
        this.setData(type, value, report);
      }
    }

    await this.sendNextMessage(report, event.replyToken);
    await this.saveReport(report, event.source.userId, user);
    return true;
  }

  private async getLINEMessage(
    type: string,
    key: string,
  ): Promise<LINEMessage> {
    const message = await this.messagesRepository.findOne({
      where: { type, key },
    });
    if (!message) {
      throw new Error(`Message is not registered: ${type}:${key}`);
    }
    return JSON.parse(message.message);
  }

  private getDefaultReportValues(): ReportStatus {
    return {
      category: this.defaultCategoryId,
      message: '',
      img: '',
      geom: { lon: 0, lat: 0 },
      scenarioTaskId: 0,
      projectId: 0,
    };
  }

  private async checkProject(
    report: ReportStatus,
    user: User,
    replyToken: string,
    projectId?: number,
  ) {
    const [disasterTrainingProjects, projectMembers] = await Promise.all([
      this.projectsRepository.find({
        where: {
          eventDateStart: LessThanOrEqual(new Date()),
          eventDateEnd: MoreThanOrEqual(new Date()),
          isDisasterTraining: true,
          id: projectId,
          scenario: {
            disableReport: false,
          },
        },
        relations: ['scenario'],
      }),
      this.projectMembersRepository.find({
        where: {
          userId: user.id,
          projectId: projectId,
          project: {
            eventDateStart: LessThanOrEqual(new Date()),
            eventDateEnd: MoreThanOrEqual(new Date()),
            scenario: {
              disableReport: false,
            },
          },
        },
        relations: ['project', 'project.scenario'],
      }),
    ]);
    const availableProjects: Project[] = projectMembers
      .map((pm) => pm.project)
      .filter((f) => f);
    disasterTrainingProjects.forEach((p) => {
      if (!availableProjects.find((project) => project.id === p.id)) {
        availableProjects.push(p);
      }
    });
    if (availableProjects.length === 0) {
      await this.lineService.replyMessage(replyToken, {
        type: 'text',
        text: '利用可能なプロジェクトがありません',
      });
      return;
    }

    if (availableProjects.length > 1) {
      await this.lineService.replyMessage(
        replyToken,
        this.createProjectSelectionMessage(
          '情報を提供するプロジェクトを選択してください',
          availableProjects,
        ),
      );
      return;
    }

    if (
      projectMembers.map((pm) => pm.project).filter((f) => f).length === 0 &&
      disasterTrainingProjects.length === 1
    ) {
      await this.projectService.joinProject(
        disasterTrainingProjects[0].id,
        user,
      );
    }
    const project = availableProjects[0];
    report.projectId = project.id;

    const scenario = await this.scenariosRepository.findOne({
      where: {
        projectId: project.id,
      },
      relations: ['scenarioTasks'],
    });
    const scenarioTask = scenario.scenarioTasks.find((scenarioTask) => {
      return scenarioTask.tasks.some((task) => task.type === 'report');
    });
    if (!scenarioTask) {
      await this.lineService.replyMessage(replyToken, {
        type: 'text',
        text: 'このプロジェクトでは情報の提供を受け付けておりません',
      });
      return;
    }
    report.scenarioTaskId = scenarioTask.id;
  }

  private createProjectSelectionMessage(
    text: string,
    projects: Project[],
  ): LINEMessage {
    return {
      type: 'template',
      altText: text,
      template: {
        text,
        type: 'buttons',
        actions: projects.map((project) => {
          return {
            type: 'postback',
            label: project.name,
            displayText: project.name,
            data: `type=project&value=${project.id}`,
          };
        }),
      },
    };
  }

  private async resetReport(
    report: ReportStatus,
    lineId: string,
    keepImage = false,
  ) {
    if (report.img && report.img !== 'none' && !keepImage) {
      await this.utilService.removeImage(report.img);
    }
    Object.assign(report, this.getDefaultReportValues());
    await this.redisClient.del(lineId);
  }

  private async saveReport(report: ReportStatus, userId: string, user: User) {
    const nextTask = await this.checkNextTask(report).catch(() => null);
    if (nextTask && nextTask.content === 'finish') {
      const reportModel = this.reportsRepository.create({
        projectId: report.projectId,
        userId: user.id,
        message: report.message,
        categoryId: report.category,
        img: report.img !== 'none' ? report.img : undefined,
        geom: report.geom
          ? { type: 'Point', coordinates: [report.geom.lon, report.geom.lat] }
          : undefined,
      });
      await this.reportsRepository.save(reportModel);
      await this.resetReport(report, userId, true);
    } else {
      await this.redisClient.set(
        userId,
        JSON.stringify({ type: 'report', data: report }),
        'EX',
        180,
      );
    }
  }

  private async sendNextMessage(report: ReportStatus, replyToken: string) {
    if (!replyToken) {
      return;
    }
    const nextTask = await this.checkNextTask(report).catch(() => null);
    if (!nextTask) {
      return;
    }

    const messages: LINEMessage[] = [];
    if (nextTask.content === 'message' || nextTask.content === 'finish') {
      messages.push(this.lineService.createTextMessage(nextTask.text));
    } else if (nextTask.content === 'img') {
      messages.push(this.createReportImageMessage(nextTask.text));
    } else if (nextTask.content === 'location') {
      messages.push(this.createReportLocationMessage(nextTask.text));
    } else if (nextTask.content === 'category') {
      messages.push(await this.createCategoryMessage(nextTask.text));
    }

    await this.lineService.replyMessage(replyToken, messages);
  }

  private async checkNextTask(
    report: ReportStatus,
  ): Promise<{ text: string; content: string } | null> {
    const scenarioTask = await this.scenarioTasksRepository.findOne({
      where: { id: report.scenarioTaskId },
    });
    if (!scenarioTask) {
      throw new Error('Not found task');
    }
    const task = scenarioTask.tasks.find((task) => {
      if (task.type !== 'report') {
        return false;
      }
      if (task.content === 'location') {
        const defaultValues = this.getDefaultReportValues();
        return (
          JSON.stringify(report.geom) === JSON.stringify(defaultValues.geom)
        );
      }
      return !report[task.content];
    });
    return task ? { text: task.text, content: task.content } : null;
  }

  private setData(attr: string, value: any, report: ReportStatus) {
    if (!['category', 'message', 'img', 'geom'].includes(attr)) {
      return;
    }
    if (attr === 'img' && !value) {
      value = 'none';
    } else if (attr === 'geom' && !value) {
      value = false;
    } else if (attr === 'category') {
      value = Number(value);
    }
    report[attr] = value;
  }

  private createReportImageMessage(text: string): LINEMessage {
    return {
      type: 'template',
      altText: text,
      template: {
        text,
        type: 'buttons',
        actions: [
          {
            type: 'uri',
            label: 'カメラを起動する',
            uri: 'https://line.me/R/nv/camera/',
          },
          {
            type: 'uri',
            label: '撮影済みのものから選択する',
            uri: 'https://line.me/R/nv/cameraRoll/single',
          },
          {
            type: 'postback',
            label: '写真はない',
            displayText: '写真はない',
            data: 'type=img&value=',
          },
        ],
      },
    };
  }

  private createReportLocationMessage(text: string): LINEMessage {
    return {
      type: 'template',
      altText: text,
      template: {
        text,
        type: 'buttons',
        actions: [
          {
            type: 'uri',
            label: '位置情報を取得する',
            uri: 'https://line.me/R/nv/location/',
          },
          {
            type: 'postback',
            label: '今はできない',
            displayText: '今はできない',
            data: 'type=geom&value=',
          },
        ],
      },
    };
  }

  private async createCategoryMessage(text: string): Promise<LINEMessage> {
    const categories = await this.categoriesRepository
      .find({ where: { available: true }, order: { id: 'ASC' } })
      .catch((e) => {
        Logger.error(e);
        return [this.categoriesRepository.create({ id: 99, name: 'その他' })];
      });
    return {
      type: 'flex',
      altText: text,
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: 'カテゴリ', size: 'xl', weight: 'bold' },
            {
              type: 'text',
              text: '以下からカテゴリを選んでください',
              margin: 'md',
            },
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          flex: 0,
          spacing: 'sm',
          contents: categories.map((category) => ({
            type: 'button',
            action: {
              data: `type=category&value=${category.id}`,
              label: category.name,
              text: category.name,
              type: 'postback',
            },
            height: 'sm',
            style: 'link',
          })),
        },
      },
    };
  }
}
