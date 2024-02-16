import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { CreateDto } from './project.dto';

@Controller('projects')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async list() {
    return await this.projectsService.list();
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    return await this.projectsService.show(id);
  }

  @Get(':id/statistic')
  async getStatistic(@Param('id', ParseIntPipe) id: number) {
    return await this.projectsService.getStatistic(id);
  }

  @Get(':id/reports')
  async getReports(@Param('id', ParseIntPipe) id: number) {
    return await this.projectsService.getReports(id);
  }

  @Get(':id/scenario')
  async getScenario(@Param('id', ParseIntPipe) id: number) {
    return await this.projectsService.getScenario(id);
  }

  @Post()
  async create(@Body() data: CreateDto) {
    return await this.projectsService.create(data);
  }

  @Delete(':id/confirmation')
  async resetConfirmation(@Param('id', ParseIntPipe) id: number) {
    return await this.projectsService.resetConfirmation(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.projectsService.delete(id);
  }

  @Get(':id/export')
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="exported.zip"')
  async exportAsZip(@Param('id', ParseIntPipe) id: number) {
    const zipStream = await this.projectsService.exportAsZip(id);
    return new StreamableFile(zipStream);
  }
}
