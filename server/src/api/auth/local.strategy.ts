import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Give Passport options
    super({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    let user;
    if (req.cookies?.remember_me && req.body._loginWithCookie) {
      user = await this.authService.isValidRememberToken(
        req.cookies.remember_me,
      );
    } else {
      user = await this.authService.validateUser(username, password);
    }
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
