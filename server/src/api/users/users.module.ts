import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserWithLineUser } from '../../entities/user_with_line_user.entity';
import { UtilModule } from '../../core/util/util.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserWithLineUser]), UtilModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
