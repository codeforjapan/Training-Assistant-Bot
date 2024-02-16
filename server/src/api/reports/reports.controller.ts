import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  UseGuards,
  StreamableFile,
  Header,
  Delete,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ReportsService } from './reports.service';
import { Roles } from '../../core/decorator/roles.decorator';

@Controller('reports')
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/img/:type')
  @Header('Content-Type', 'image/jpeg')
  async getImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('type') type: string,
  ) {
    if (type !== 'original' && type !== 'thumbnail') {
      throw new NotFoundException();
    }
    const stream = await this.reportsService.getImage(id, type);
    return new StreamableFile(stream);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.delete(id);
  }
}
