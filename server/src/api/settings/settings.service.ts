import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../entities/setting.entity';
import { UpdateDto } from './setting.dto';
import { AuthenticatedGuard } from '../../core/guards/authenticated.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';

@Injectable()
@UseGuards(AuthenticatedGuard, RolesGuard)
@Roles('Admin')
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  async list(): Promise<Setting[]> {
    return await this.settingsRepository.find();
  }

  async update(key: string, data: UpdateDto): Promise<Setting> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      throw new NotFoundException();
    }
    setting.value = data.value;
    await this.settingsRepository.save(setting);
    return setting;
  }
}
