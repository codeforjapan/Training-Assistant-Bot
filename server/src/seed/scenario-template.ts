import { DataSource } from 'typeorm';
import { ScenarioTemplate } from '../entities/scenario-template.entity';
import { Logger } from '@nestjs/common';

export default async (datasource: DataSource, logger: Logger) => {
  const scenarioTemplatesRepository =
    datasource.getRepository<ScenarioTemplate>('ScenarioTemplate');
  const count = await scenarioTemplatesRepository.count();
  if (count !== 0) {
    logger.log('ScenarioTemplate table is not empty. Skip seeding.');
    return;
  }
  await scenarioTemplatesRepository.save([
    {
      name: '防災訓練',
      tasks: [
        {
          name: 'スタートメッセージ（アンケート付き）',
          order: 1,
          isInitial: true,
          removable: false,
          tasks: [
            {
              type: 'project-notification' as const,
              text: '参加をお願いします',
              joinLabel: '参加する',
              requiredOrder: 0,
              targets: [],
            },
            {
              type: 'message' as const,
              text: '参加ありがとうございます。続いて、アンケートにご協力ください',
            },
            {
              type: 'ques' as const,
              text: '地域を選択してください',
              dataKey: 'group',
              items: [],
            },
            {
              type: 'ques' as const,
              text: '性別を教えてください',
              dataKey: 'gender',
              items: [
                { label: '男性', data: 'man' },
                { label: '女性', data: 'woman' },
                { label: '選択しない', data: 'unknown' },
              ],
            },
            {
              type: 'ques' as const,
              text: '年齢を教えてください',
              dataKey: 'generation',
              items: [
                { label: '29歳以下', data: 'u30' },
                { label: '30〜49歳以下', data: 'u50' },
                { label: '50〜69歳以下', data: 'u70' },
                { label: '70歳以上', data: 'o70' },
              ],
            },
            {
              type: 'message' as const,
              text: 'ご協力ありがとうございました。',
            },
          ],
        },
        {
          name: '発生周知',
          order: 2,
          removable: true,
          tasks: [{ type: 'message' as const, text: '地震が発生しました。' }],
        },
        {
          name: '安否確認',
          order: 3,
          removable: false,
          tasks: [
            {
              type: 'confirmation' as const,
              text: '安全は確保されましたか？',
              dataKey: 'confirmed',
              ok: { label: '無事です' },
              no: { label: '確認中' },
            },
          ],
        },
        {
          name: '対策本部設置周知',
          order: 4,
          removable: true,
          tasks: [
            {
              type: 'message' as const,
              text: '対策本部を設置しました。',
            },
          ],
        },
        {
          name: '報告協力要請',
          order: 5,
          removable: false,
          tasks: [
            {
              type: 'message' as const,
              text: 'メニューから情報の提供をお願いいたします。',
            },
            {
              type: 'report' as const,
              content: 'location' as const,
              text: 'あなたの位置を教えてください',
            },
            {
              type: 'report' as const,
              content: 'img' as const,
              text: '写真がある場合は送ってください',
            },
            {
              type: 'report' as const,
              content: 'message' as const,
              text: '状況を教えてください\n(文字を入力するには左下のキーボードのアイコンを選択してください)',
            },
            {
              type: 'report' as const,
              content: 'finish' as const,
              text: 'ありがとうございました',
            },
          ],
        },
        {
          name: '参加のお礼',
          order: 6,
          removable: true,
          tasks: [
            {
              type: 'message' as const,
              text: 'ご協力ありがとうございました。',
            },
          ],
        },
      ],
    },
    {
      name: 'ベーシック',
      tasks: [
        {
          name: 'スタートメッセージ（アンケート付き）',
          order: 1,
          isInitial: true,
          removable: false,
          tasks: [
            {
              type: 'project-notification' as const,
              text: '参加をお願いします',
              joinLabel: '参加する',
              requiredOrder: 0,
              targets: [],
            },
            {
              type: 'message' as const,
              text: '参加ありがとうございます。続いて、アンケートにご協力ください',
            },
            {
              type: 'ques' as const,
              text: '地域を選択してください',
              dataKey: 'group',
              items: [],
            },
            {
              type: 'ques' as const,
              text: '性別を教えてください',
              dataKey: 'gender',
              items: [
                { label: '男性', data: 'man' },
                { label: '女性', data: 'woman' },
                { label: '選択しない', data: 'unknown' },
              ],
            },
            {
              type: 'ques' as const,
              text: '年齢を教えてください',
              dataKey: 'generation',
              items: [
                { label: '29歳以下', data: 'u30' },
                { label: '30〜49歳以下', data: 'u50' },
                { label: '50〜69歳以下', data: 'u70' },
                { label: '70歳以上', data: 'o70' },
              ],
            },
            {
              type: 'message' as const,
              text: 'ご協力ありがとうございました。',
            },
          ],
        },
        {
          name: '報告協力要請',
          order: 2,
          removable: false,
          tasks: [
            {
              type: 'message' as const,
              text: 'メニューから情報の提供をお願いいたします。',
            },
            {
              type: 'report' as const,
              content: 'location' as const,
              text: 'あなたの位置を教えてください',
            },
            {
              type: 'report' as const,
              content: 'img' as const,
              text: '写真がある場合は送ってください',
            },
            {
              type: 'report' as const,
              content: 'message' as const,
              text: '状況を教えてください\n(文字を入力するには左下のキーボードのアイコンを選択してください)',
            },
            {
              type: 'report' as const,
              content: 'finish' as const,
              text: 'ありがとうございました',
            },
          ],
        },
        {
          name: '参加のお礼',
          order: 3,
          removable: true,
          tasks: [
            {
              type: 'message' as const,
              text: 'ご協力ありがとうございました。',
            },
          ],
        },
      ],
    },
    {
      name: '安否確認',
      disableReport: true,
      tasks: [
        {
          name: 'スタートメッセージ（アンケート付き）',
          order: 1,
          isInitial: true,
          removable: false,
          tasks: [
            {
              type: 'project-notification' as const,
              text: '参加をお願いします',
              joinLabel: '参加する',
              requiredOrder: 0,
              targets: [],
            },
            {
              type: 'message' as const,
              text: '参加ありがとうございます。続いて、アンケートにご協力ください',
            },
            {
              type: 'ques' as const,
              text: '地域を選択してください',
              dataKey: 'group',
              items: [],
            },
            {
              type: 'message' as const,
              text: 'ご協力ありがとうございました。',
            },
          ],
        },
        {
          name: '安否確認',
          order: 2,
          removable: false,
          tasks: [
            {
              type: 'confirmation' as const,
              text: '安全は確保されましたか？',
              dataKey: 'confirmed',
              ok: { label: '無事です' },
              no: { label: '確認中' },
            },
          ],
        },
      ],
    },
  ]);
};
