import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'phc-bcrypt';
import { User } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePasswordDto } from './auth.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    username: string,
    rawPassword: string,
  ): Promise<Omit<User, 'password'>> {
    if (!username || !rawPassword) {
      throw new UnauthorizedException();
    }
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException();
    }

    const isCorrectPassword = await bcrypt.verify(user.password, rawPassword);
    if (!isCorrectPassword) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    return result;
  }

  async getUser(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async changePassword(id: number, data: UpdatePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new ForbiddenException();
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    user.password = hashedPassword;
    await this.usersRepository.save(user);
  }

  async generateRememberMeToken(id: number): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new ForbiddenException();
    }
    const tokenSecret = this.configService.get<string>('tokenSecret');
    const rememberToken = crypto.randomBytes(20).toString('hex');
    const hash = crypto
      .createHmac('sha256', tokenSecret)
      .update(user.id + '-' + rememberToken)
      .digest('hex');
    user.rememberMeToken = rememberToken;
    await this.usersRepository.save(user);
    return `${rememberToken}|${hash}`;
  }

  async isValidRememberToken(token: string): Promise<User> {
    const [rememberMeToken, hash] = token.split('|');
    const tokenSecret = this.configService.get<string>('tokenSecret');
    const users = await this.usersRepository.find({
      where: { rememberMeToken },
    });
    return users.find((user) => {
      const verifyingHash = crypto
        .createHmac('sha256', tokenSecret)
        .update(user.id + '-' + rememberMeToken)
        .digest('hex');
      return hash === verifyingHash;
    });
  }
}
