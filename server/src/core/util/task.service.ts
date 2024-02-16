import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { Repository } from 'typeorm';
import { Message as LINEMessage } from '@line/bot-sdk';
import { LineService } from './line.service';
import { Project } from '../../entities/project.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    @InjectRepository(ScenarioTask)
    private readonly scenarioTasksRepository: Repository<ScenarioTask>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly lineService: LineService,
  ) {}

  async collectNextTasks(id: number, index = 0) {
    const scenarioTask = await this.scenarioTasksRepository.findOne({
      where: { id },
    });
    if (!scenarioTask) {
      throw new Error('ScenarioTask does not exist');
    }
    const tasks: Record<string, any> = [];
    let lastIndex = index;
    for (; lastIndex < scenarioTask.tasks.length; lastIndex++) {
      const task = scenarioTask.tasks[lastIndex];
      if (task.type === 'message') {
        tasks.push(task);
      } else if (task.type === 'ques' || task.type === 'confirmation') {
        tasks.push(task);
        break;
      } else {
        this.logger.warn(`Invalid task type: ${JSON.stringify(task)}`);
      }
    }
    return { tasks, lastIndex };
  }

  async executeNextTask(
    replyToken: string,
    scenarioTaskId: number,
    scenarioIndex: number,
    projectId: number,
  ) {
    const { tasks, lastIndex } = await this.collectNextTasks(
      scenarioTaskId,
      scenarioIndex + 1,
    );
    const lineMessages: LINEMessage[] = [];
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (task.type === 'message') {
        lineMessages.push(this.lineService.createTextMessage(task.text));
      } else if (task.type === 'ques') {
        if (task.dataKey === 'group') {
          const project = await this.projectsRepository.findOne({
            where: { id: projectId },
          });
          if (!project) {
            throw new Error('Not found project');
          }
          if (!project.setting || !project.setting.groups) {
            throw new Error('Project is not initialized correctly');
          }
          task.items = project.setting.groups.map((group) => ({
            label: group,
            data: group,
          }));
        }
        lineMessages.push(
          this.lineService.createQuesMessage(
            task.text,
            task.dataKey,
            task.items,
            projectId,
            scenarioTaskId,
            lastIndex,
          ),
        );
      } else if (task.type === 'confirmation') {
        lineMessages.push(
          this.lineService.createConfirmationMessage(
            task.text,
            task.dataKey,
            task.ok,
            task.no,
            projectId,
            scenarioTaskId,
            lastIndex,
          ),
        );
      }
    }
    if (lineMessages.length > 0) {
      await this.lineService.replyMessage(replyToken, lineMessages);
    }
  }
}
