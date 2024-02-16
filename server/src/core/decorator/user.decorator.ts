import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SerializedUser } from '../../api/auth/auth.serializer';

export const User = createParamDecorator(
  (data: keyof SerializedUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!data) {
      return user;
    }
    if (!user) {
      return;
    }
    return user[data];
  },
);
