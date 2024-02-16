import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApplicationLogFormat } from '../logger/app-logger.service';

export type ApplicationLogInfo = Omit<ApplicationLogFormat, 'message'>;
export const LogInfo = createParamDecorator(
  (functionName: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.id;
    return { userId, function: functionName };
  },
);
