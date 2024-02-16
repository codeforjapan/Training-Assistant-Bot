import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { AuthSerializer } from './auth.serializer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ session: true }),
  ],
  providers: [AuthService, LocalStrategy, AuthSerializer],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
