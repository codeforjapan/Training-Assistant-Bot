import { Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
