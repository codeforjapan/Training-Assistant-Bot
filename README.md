# KobeBotLab
LINEのMessaging APIを利用したBotサービスを提供するためのサーバーと管理画面です。

## 必要環境
- Docker
- Docker Compose

LINEのMessaging APIを利用するための手続き等はLINEの公式ドキュメントを参照してください。  
https://developers.line.biz/ja/services/messaging-api/

## 開発

```shell
$ cp .env.example .env
$ ./gen-secrets.sh
# .envを編集
$ docker compose up -d
$ docker compose exec api npm run db:init
$ docker compose restart api
# localhost:8080にアクセス
# デフォルトログイン情報: admin / botlab
```

## LINEとの連携
LINE DeveloperのMessaging APIのWebhook URLは`https://[ドメイン名]/api/line`を指定してください。  
なおLINEからのリクエストを受け取るためにはHTTPSでの通信が必要なため、ngrok等を利用してローカルサーバーを公開する必要があります。
