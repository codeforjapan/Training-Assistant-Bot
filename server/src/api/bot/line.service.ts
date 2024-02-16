import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LineEvent } from '../../entities/line-event.entity';
import { validateSignature, WebhookRequestBody } from '@line/bot-sdk';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LineService {
  constructor(
    @InjectRepository(LineEvent)
    private lineEventRepository: Repository<LineEvent>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {}

  async save(body: WebhookRequestBody): Promise<void> {
    this.eventEmitter.emit('lineEvent', { body });
    const lineEvents = body.events.map((event) =>
      this.lineEventRepository.create({
        destination: body.destination,
        event,
      }),
    );
    await Promise.all([this.lineEventRepository.save(lineEvents)]);
  }

  async isValidRequest(
    body: WebhookRequestBody,
    lineSignature: string,
  ): Promise<boolean> {
    const secret = this.configService.get<string>('line.secret');
    return validateSignature(JSON.stringify(body), secret ?? '', lineSignature);
  }
}
