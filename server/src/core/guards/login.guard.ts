import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LoginGuard extends AuthGuard('local') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      request.cookies?.remember_me &&
      !request.body?.username &&
      !request.body?.password
    ) {
      request.body.username = 'cookie';
      request.body.password = 'cookie';
      request.body.keepSession = true;
      request.body._loginWithCookie = true;
    }
    await super.canActivate(context);
    await super.logIn(request);
    return true;
  }
}
