import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { UpdateDto } from './scenario.dto';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';

@Controller('scenarios')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Get()
  async list() {
    return await this.scenariosService.list();
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDto) {
    return await this.scenariosService.update(id, data);
  }

  @Post(':id/reset')
  async reset(@Param('id', ParseIntPipe) id: number) {
    return await this.scenariosService.reset(id);
  }

  @Post(':id/tasks/:scenarioTaskId/send')
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Param('scenarioTaskId', ParseIntPipe) scenarioTaskId: number,
  ) {
    return await this.scenariosService.sendMessage(id, scenarioTaskId);
  }
}
