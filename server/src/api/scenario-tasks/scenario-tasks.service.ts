import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { CreateDto, UpdateDto } from './scenario-task.dto';
import { Scenario } from '../../entities/scenario.entity';

@Injectable()
export class ScenarioTasksService {
  constructor(
    @InjectRepository(ScenarioTask)
    private readonly scenarioTasksRepository: Repository<ScenarioTask>,
    @InjectRepository(Scenario)
    private readonly scenariosRepository: Repository<Scenario>,
  ) {}

  async show(id: number): Promise<ScenarioTask> {
    return await this.findScenarioTask(id);
  }

  async create(data: CreateDto): Promise<ScenarioTask> {
    const scenario = await this.scenariosRepository.findOne({
      where: { id: data.scenarioId },
    });
    if (!scenario) {
      throw new BadRequestException(`Scenario does not exist`);
    }
    const scenarioTask = this.scenarioTasksRepository.create({
      ...data,
      tasks: [],
    });
    await this.scenarioTasksRepository.save(scenarioTask);
    return scenarioTask;
  }

  async update(id: number, data: UpdateDto): Promise<ScenarioTask> {
    const scenarioTask = await this.findScenarioTask(id);
    if (data.name !== undefined) {
      scenarioTask.name = data.name;
    }
    if (data.tasks !== undefined) {
      scenarioTask.tasks = data.tasks;
    }
    await this.scenarioTasksRepository.save(scenarioTask);
    return scenarioTask;
  }

  private async findScenarioTask(
    id: number,
    relations?: { scenario: boolean },
  ): Promise<ScenarioTask> {
    const scenarioTask = await this.scenarioTasksRepository.findOne({
      where: { id },
      relations,
    });
    if (!scenarioTask) {
      throw new NotFoundException();
    }
    return scenarioTask;
  }
}
