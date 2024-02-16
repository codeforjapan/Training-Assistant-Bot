import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateDto, UpdateDto } from './group.dto';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';

@Controller('groups')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  async list() {
    return await this.groupsService.list();
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return await this.groupsService.show(id);
  }

  @Post()
  async create(@Body() data: CreateDto) {
    return await this.groupsService.create(data);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDto) {
    return await this.groupsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.groupsService.delete(id);
  }
}
