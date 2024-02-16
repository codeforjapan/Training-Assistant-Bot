import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateDto } from './setting.dto';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';

@Controller('settings')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async list() {
    return await this.settingsService.list();
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body() data: UpdateDto) {
    return await this.settingsService.update(key, data);
  }
}
