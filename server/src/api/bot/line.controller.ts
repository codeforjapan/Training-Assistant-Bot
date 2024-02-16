import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Logger,
  Post,
} from '@nestjs/common';
import { WebhookRequestBody } from '@line/bot-sdk';
import { LineService } from './line.service';

@Controller({
  path: 'line',
})
export class LINEController {
  private readonly logger = new Logger(LINEController.name);
  constructor(private readonly lineService: LineService) {}

  @Post()
  async main(
    @Body() body: WebhookRequestBody,
    @Headers('x-line-signature') lineSignature: string,
  ) {
    const isValid = await this.lineService.isValidRequest(body, lineSignature);
    if (!isValid) {
      throw new BadRequestException();
    }
    await this.lineService.save(body).catch((e) => {
      this.logger.error(e.message, e.stack);
    });
  }
}
