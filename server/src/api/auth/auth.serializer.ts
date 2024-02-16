import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserRoles, User } from '../../entities/user.entity';

export interface SerializedUser {
  id: number;
  isAdmin: boolean;
  ipAddress: string;
  loginAt: string;
  username: string;
}

@Injectable()
export class AuthSerializer extends PassportSerializer {
  serializeUser(
    user: User,
    done: (err: Error | null, user: SerializedUser) => void,
  ): any {
    done(null, {
      id: user.id,
      isAdmin: user.isAdmin,
      ipAddress: '',
      username: user.username,
      loginAt: new Date().toISOString(),
    });
  }
  deserializeUser(
    payload: any,
    done: (err: Error | null, payload: string) => void,
  ): any {
    done(null, payload);
  }
}
