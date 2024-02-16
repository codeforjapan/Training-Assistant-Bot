import { Injectable, Logger } from '@nestjs/common';
import { FlexMessage, Message as LINEMessage } from '@line/bot-sdk/dist/types';
import { ConfigService } from '@nestjs/config';
import { Client, Profile } from '@line/bot-sdk';
import { Readable } from 'stream';
import { AppLogger } from '../logger/app-logger.service';

const keyMaps = {
  action: 'a',
  projectId: 'p',
  data: 'd',
  scenarioTaskId: 'sti',
  index: 'idx',
};

export interface PostbackData {
  action: string;
  projectId: number;
  data: string;
  scenarioTaskId: number;
  index: number;
}

@Injectable()
export class LineService {
  private readonly lineClient: Client;
  private readonly logger = new Logger(LineService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly appLogger: AppLogger,
  ) {
    this.lineClient = new Client({
      channelAccessToken: this.configService.get('line.token'),
      channelSecret: this.configService.get('line.secret'),
    });
    const isReplyDisabled =
      this.configService.get<boolean>('line.disableReply');
    if (isReplyDisabled) {
      this.lineClient.replyMessage = () => Promise.resolve({});
    }
  }

  createProjectNotificationMessage(
    projectId: number,
    text: string,
    joinLabel: string,
    scenarioTaskId: number,
  ): LINEMessage {
    return {
      type: 'template',
      altText: text,
      template: {
        type: 'buttons',
        text: text,
        actions: [
          {
            type: 'postback',
            label: joinLabel,
            data: this.createPostbackData({
              action: 'join',
              projectId,
              data: '',
              scenarioTaskId,
              index: 0,
            }),
            displayText: joinLabel,
          },
        ],
      },
    };
  }

  createPostbackData(postbackData: PostbackData): string {
    return Object.keys(postbackData)
      .map((key) => `${keyMaps[key]}=${postbackData[key]}`)
      .join('&');
  }

  parsePostbackData(data: string): PostbackData {
    const result = {
      action: '',
      projectId: 0,
      data: '',
      scenarioTaskId: 0,
      index: 0,
    } as PostbackData;
    if (!data) {
      return result;
    }
    data.split('&').forEach((keyVal) => {
      Object.keys(keyMaps).forEach((key) => {
        if (keyVal.startsWith(`${keyMaps[key]}=`)) {
          const val = keyVal.replace(`${keyMaps[key]}=`, '');
          result[key] = key === 'action' || key === 'data' ? val : Number(val);
        }
      });
    });
    return result;
  }

  createTextMessage(text: string): LINEMessage {
    return {
      type: 'text',
      text,
    };
  }

  createQuesMessage(
    text: string,
    dataKey: string,
    ques: { label: string; data: string }[],
    projectId: number,
    scenarioTaskId: number,
    scenarioIndex: number,
  ): LINEMessage {
    const longTexts: string[] = [];
    const useLongText = ques.some((question) => question.label.length > 12);
    const actions = ques.map((question, idx) => {
      const data = this.createPostbackData({
        action: 'ques',
        projectId,
        data: `${dataKey}=${question.data}`,
        scenarioTaskId,
        index: scenarioIndex,
      });
      if (useLongText) {
        longTexts.push(`${idx + 1}: ${question.label}`);
      }
      return {
        type: 'postback' as const,
        label: useLongText ? String(idx + 1) : question.label,
        data,
        displayText: question.label,
      };
    });
    const template = {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'baseline',
        backgroundColor: '#fafafa',
        contents: [
          {
            type: 'text',
            text: useLongText ? `${text}\n\n${longTexts.join('\n')}` : text,
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: actions.map((action) => ({
          type: 'button',
          action,
        })),
      },
    };
    return { type: 'flex', altText: text, contents: template } as FlexMessage;
  }

  createConfirmationMessage(
    text: string,
    dataKey: string,
    ok: { label: string },
    no: { label: string },
    projectId: number,
    scenarioTaskId: number,
    scenarioIndex: number,
  ): LINEMessage {
    const okData = this.createPostbackData({
      action: 'ques',
      projectId,
      data: `${dataKey}=ok`,
      scenarioTaskId,
      index: scenarioIndex,
    });
    const noData = this.createPostbackData({
      action: 'ques',
      projectId,
      data: `${dataKey}=no`,
      scenarioTaskId,
      index: scenarioIndex,
    });
    return {
      type: 'template',
      altText: text,
      template: {
        type: 'confirm',
        text: text,
        actions: [
          {
            type: 'postback' as const,
            label: no.label,
            data: noData,
            displayText: no.label,
          },
          {
            type: 'postback' as const,
            label: ok.label,
            data: okData,
            displayText: ok.label,
          },
        ],
      },
    };
  }

  async send(message: LINEMessage | LINEMessage[], userIds: string[]) {
    if (userIds.length > 500) {
      for (let i = 0; i < userIds.length / 500; i++) {
        await this.lineClient
          .multicast(userIds.slice(i * 500, (i + 1) * 500), message)
          .catch((e) => this.logger.error(e));
      }
    } else {
      await this.lineClient
        .multicast(userIds, message)
        .catch((e) => this.logger.error(e));
    }
  }

  async broadcast(message: LINEMessage) {
    const canBroadcast = this.configService.get<boolean>(
      'line.allowBroadcast',
      false,
    );
    if (!canBroadcast) {
      this.appLogger.log({
        level: 'error',
        function: 'line.broadcast',
        message: `Doesn't allow to broadcast`,
      });
      throw new Error(`Doesn't allow to broadcast`);
    }
    await this.lineClient
      .broadcast(message as LINEMessage)
      .catch((e) => this.logger.error(e));
    this.appLogger.log({
      level: 'info',
      function: 'line.broadcast',
      message: `Broadcast message`,
    });
  }

  async replyMessage(replyToken: string, message: LINEMessage | LINEMessage[]) {
    await this.lineClient
      .replyMessage(replyToken, message)
      .catch((e) => this.logger.error(e));
  }

  async getMessageContent(messageId: string): Promise<Readable> {
    return await this.lineClient.getMessageContent(messageId);
  }

  async getProfile(userId: string): Promise<Profile> {
    return await this.lineClient.getProfile(userId);
  }
}
