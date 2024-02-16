import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../../core/guards/roles.guard';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { Roles } from '../../core/decorator/roles.decorator';

@Controller('users')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list() {
    return await this.usersService.list();
  }
}
