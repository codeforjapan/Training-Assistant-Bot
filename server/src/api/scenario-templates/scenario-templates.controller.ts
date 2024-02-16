import { Controller, Get, UseGuards } from '@nestjs/common';
import { ScenarioTemplatesService } from './scenario-templates.service';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';

@Controller('scenario-templates')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class ScenarioTemplatesController {
  constructor(
    private readonly scenarioTemplatesService: ScenarioTemplatesService,
  ) {}

  @Get()
  async list() {
    return await this.scenarioTemplatesService.list();
  }
}
