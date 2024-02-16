import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { UserWithLineUser } from '../../entities/user_with_line_user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserWithLineUser)
    private userWithLineUsersRepository: Repository<UserWithLineUser>,
  ) {}

  async list() {
    return this.userWithLineUsersRepository.find({
      where: { lineId: Not(IsNull()) },
      select: ['id', 'name'],
    });
  }
}
