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
import { ScenarioTasksService } from './scenario-tasks.service';
import { UpdateDto, CreateDto } from './scenario-task.dto';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';

@Controller('scenario-tasks')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class ScenarioTasksController {
  constructor(private readonly scenarioTasksService: ScenarioTasksService) {}

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return this.scenarioTasksService.show(id);
  }

  @Post()
  async create(@Body() data: CreateDto) {
    return this.scenarioTasksService.create(data);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateDto) {
    return this.scenarioTasksService.update(id, data);
  }
}
