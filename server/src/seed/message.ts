import { DataSource } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Logger } from '@nestjs/common';

export default async (datasource: DataSource, logger: Logger) => {
  const messagesRepository = datasource.getRepository<Message>('Message');
  const count = await messagesRepository.count();
  if (count !== 0) {
    logger.log('Message table is not empty. Skip seeding.');
    return;
  }
  await messagesRepository.save([
    {
      key: 'request-category',
      type: 'line',
      message:
        '{"type":"flex","altText":"Flex Message","contents":{"type":"bubble","body":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"カテゴリ","size":"xl","weight":"bold"},{"type":"text","text":"以下からカテゴリを選んでください","margin":"md"}]},"footer":{"type":"box","layout":"vertical","flex":0,"spacing":"sm","contents":[]}}}',
    },
    {
      key: 'request-img',
      type: 'line',
      message:
        '{"type":"template","altText":"this is a buttons template","template":{"type":"buttons","actions":[{"type":"uri","label":"カメラを起動する","uri":"https://line.me/R/nv/camera/"},{"type":"uri","label":"撮影済みのものから選択する","uri":"https://line.me/R/nv/cameraRoll/single"},{"type":"postback","label":"写真はない","text":"写真はない","data":"type=img&value="}],"text":"写真がある場合は送ってください"}}',
    },
    {
      key: 'request-message',
      type: 'line',
      message:
        '{"type":"text","text":"状況を教えてください\\n(文字を入力するには左下のキーボードのアイコンを選択してください)"}',
    },
    {
      key: 'request-position',
      type: 'line',
      message:
        '{"type":"template","altText":"this is a buttons template","template":{"type":"buttons","actions":[{"type":"uri","label":"位置情報を取得する","uri":"https://line.me/R/nv/location/"},{"type":"postback","label":"今はできない","text":"今はできない","data":"type=position&value="}],"text":"あなたの位置を教えてください"}}',
    },
    {
      key: 'request-confirm',
      type: 'line',
      message:
        '{"type":"flex","altText":"下記内容で報告します","contents":{"type":"bubble","header":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"下記内容で報告します","wrap":true}]},"body":{"type":"box","layout":"vertical","contents":[]},"footer":{"type":"box","layout":"vertical","contents":[{"type":"button","action":{"type":"postback","label":"上記内容で報告","data":"type=confirm&ans=true","displayText":"報告"}},{"type":"button","action":{"type":"postback","label":"キャンセル","data":"type=confirm&ans=false","displayText":"キャンセル"}}]},"styles":{"header":{"backgroundColor":"#f9f9f9"}}}}',
    },
    {
      key: 'request-completed',
      type: 'line',
      message:
        '{"type":"text","text":"報告が完了しました。ありがとうございました。"}',
    },
    {
      key: 'request-canceled',
      type: 'line',
      message: '{"type":"text","text":"報告をキャンセルしました。"}',
    },
    {
      key: 'profile-description',
      type: 'line',
      message: '{"type":"text","text":"アンケートにご協力ください。"}',
    },
    {
      key: 'profile-area',
      type: 'line',
      message:
        '{"type":"template","altText":"お住いの地域を教えてください。","template":{"type":"buttons","text":"お住いの地域を教えてください。","actions":[]}}',
    },
    {
      key: 'profile-sex',
      type: 'line',
      message:
        '{"type":"template","altText":"性別を教えてください","template":{"type":"buttons","text":"性別を教えてください。","actions":[{"type":"postback","label":"男性","data":"type=sex&value=m&lo=profile","displayText":"男性"},{"type":"postback","label":"女性","data":"type=sex&value=f&lo=profile","displayText":"女性"},{"type":"postback","label":"指定しない","data":"type=sex&value=u&lo=profile","displayText":"指定しない"}]}}',
    },
    {
      key: 'profile-generation',
      type: 'line',
      message:
        '{"type":"template","altText":"年齢を教えてください。","template":{"type":"buttons","text":"年齢を教えてください。","actions":[{"type":"postback","label":"29歳以下","data":"type=generation&value=-29&lo=profile","displayText":"29歳以下"},{"type":"postback","label":"30歳~49歳","data":"type=generation&value=30-49&lo=profile","displayText":"30歳~49歳"},{"type":"postback","label":"50歳〜69歳","data":"type=generation&value=50-69&lo=profile","displayText":"50歳〜69歳"},{"type":"postback","label":"70歳以上","data":"type=generation&value=70-&lo=profile","displayText":"70歳以上"}]}}',
    },
    {
      key: 'profile-completed',
      type: 'line',
      message: '{"type":"text","text":"ご協力ありがとうございました。"}',
    },
    {
      key: 'project-join',
      type: 'line',
      message: '{"type":"text","text":"ご協力ありがとうございました。"}',
    },
  ]);
};
