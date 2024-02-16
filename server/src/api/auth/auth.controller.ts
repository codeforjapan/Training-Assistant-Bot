import {
  Controller,
  Res,
  Post,
  UseGuards,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Session,
  Logger,
  UnauthorizedException,
  Patch,
  Body,
} from '@nestjs/common';
import { LoginGuard } from '../../core/guards/login.guard';
import { Response, Request } from 'express';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { AuthService } from './auth.service';
import { SessionData } from 'express-session';
import { AppLogger } from '../../core/logger/app-logger.service';
import { UpdatePasswordDto } from './auth.dto';
import { User } from '../../core/decorator/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLogger,
  ) {}

  @Post('/login')
  @UseGuards(LoginGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Session() session: SessionData,
    @Body() { keepSession }: { keepSession?: boolean },
  ) {
    if (!req.isAuthenticated()) {
      throw new UnauthorizedException();
    }
    res.clearCookie('remember_me');
    const user = req.user;
    if (keepSession) {
      const token = await this.authService.generateRememberMeToken(user.id);
      res.cookie('remember_me', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }
    session.ipAddress = req.ip;
    this.logger.log({
      level: 'info',
      userId: user.id,
      function: 'login',
      message: 'Login user',
    });
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!req.isAuthenticated()) {
      return;
    }
    const { user } = req;
    res.clearCookie('remember_me');
    req.logout((err) => {
      this.logger.log({
        level: 'info',
        userId: user.id,
        function: 'logout',
        message: `Logout user`,
      });
      if (err) {
        Logger.error(err);
      }
    });
  }

  @Get('/user')
  @UseGuards(AuthenticatedGuard)
  async user(@User('id') id: number) {
    return await this.authService.getUser(id);
  }

  @Patch('/user')
  @UseGuards(AuthenticatedGuard)
  async password(@User('id') id: number, @Body() data: UpdatePasswordDto) {
    await this.authService.changePassword(id, data);
    return { result: true };
  }
}
