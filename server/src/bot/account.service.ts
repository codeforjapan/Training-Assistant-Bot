import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LineUser } from '../entities/line-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Client, MessageEvent, TextMessage } from '@line/bot-sdk';
import * as generator from 'generate-password';
import * as bcrypt from 'phc-bcrypt';
import { Message } from '../entities/message.entity';
import { LineService } from '../core/util/line.service';
import { AppLogger } from '../core/logger/app-logger.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(LineUser)
    private readonly lineUsersRepository: Repository<LineUser>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly lineService: LineService,
    private readonly appLogger: AppLogger,
  ) {}

  async register(id: string): Promise<User> {
    const user = await this.getUserFromLineUser(id);
    if (user) {
      this.appLogger.log({
        level: 'info',
        function: 'bot.register',
        message: 'User already registered',
      });
      return user;
    }

    const profile = await this.lineService.getProfile(id);
    const newUser = await this.usersRepository.save({
      username: `!temp_${id.slice(6, 12)}_${Date.now()}`,
      name: profile.displayName,
      password: await bcrypt.hash(
        generator.generate({ length: 10, numbers: true }),
      ),
    });
    await this.lineUsersRepository.save({
      id,
      name: profile.displayName,
      userId: newUser.id,
      pictureUrl: profile.pictureUrl,
    });
    this.appLogger.log({
      level: 'info',
      function: 'bot.register',
      message: `Registered user: ${newUser.username}`,
    });
    return newUser;
  }

  async unregister(id: string): Promise<void> {
    const user = await this.getUserFromLineUser(id);
    if (!user) {
      this.appLogger.log({
        level: 'error',
        function: 'bot.unregister',
        message: `Not found user: ${id}`,
      });
      return;
    }
    this.appLogger.log({
      level: 'info',
      userId: user.id,
      function: 'bot.unregister',
      message: `Unregistered user: ${user.name}`,
    });
    await this.usersRepository.save(user);
  }

  async getUserFromLineUser(id: string): Promise<User | undefined> {
    const lineUser = await this.lineUsersRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return lineUser?.user;
  }

  async password(event: MessageEvent, client: Client) {
    const username =
      event.message.type === 'text'
        ? event.message.text.replace('パスワード', '')
        : false;
    if (!username) {
      return false;
    }

    const user = await this.getUserFromLineUser(event.source.userId);
    if (!user || user.username !== username) {
      return false;
    }
    const password = generator.generate({ length: 6, numbers: true });
    user.password = await bcrypt.hash(password);

    await this.usersRepository.save(user);

    const message = await this.messagesRepository.findOne({
      where: { type: 'line', key: 'password' },
    });
    if (!message) {
      return false;
    }
    const lineMessage = JSON.parse(message.message) as TextMessage;
    lineMessage.text = lineMessage.text.replace('【】', `【${password}】`);
    await client
      .replyMessage(event.replyToken, lineMessage)
      .catch((e) => Logger.error(e));
    return true;
  }
}
