import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ScenarioTemplate } from '../../entities/scenario-template.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ScenarioTemplatesService {
  constructor(
    @InjectRepository(ScenarioTemplate)
    private readonly scenarioTemplatesRepository: Repository<ScenarioTemplate>,
  ) {}

  async list(): Promise<ScenarioTemplate[]> {
    return await this.scenarioTemplatesRepository.find();
  }
}
