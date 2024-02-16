import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message as LINEMessage } from '@line/bot-sdk/dist/types';
import { Scenario } from '../../entities/scenario.entity';
import { In, Repository } from 'typeorm';
import { UpdateDto } from './scenario.dto';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { Group } from '../../entities/group.entity';
import { LineUser } from '../../entities/line-user.entity';
import { Project } from '../../entities/project.entity';
import { TaskService } from '../../core/util/task.service';
import { LineService } from '../../core/util/line.service';
import { ProjectMember } from '../../entities/project-member.entity';

@Injectable()
export class ScenariosService {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenariosRepository: Repository<Scenario>,
    @InjectRepository(ScenarioTask)
    private readonly scenarioTasksRepository: Repository<ScenarioTask>,
    @InjectRepository(Group)
    private readonly groupsRepository: Repository<Group>,
    @InjectRepository(LineUser)
    private readonly lineUsersRepository: Repository<LineUser>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
    private readonly taskService: TaskService,
    private readonly lineService: LineService,
  ) {}

  async list(): Promise<Scenario[]> {
    return await this.scenariosRepository.find({
      relations: ['project'],
    });
  }

  async update(id: number, data: UpdateDto): Promise<Scenario> {
    const scenario = await this.findScenario(id, { scenarioTasks: true });
    const validScenarioTaskIds: number[] = data.scenarioTasks.map(
      (st) => st.id,
    );
    const deletedScenarioTasks = scenario.scenarioTasks.filter(
      (scenarioTask) => !validScenarioTaskIds.includes(scenarioTask.id),
    );
    await this.scenarioTasksRepository.remove(deletedScenarioTasks);
    for(const scenarioTask of data.scenarioTasks) {
      const st = scenario.scenarioTasks.find((st) => st.id === scenarioTask.id);
      if (st) {
        st.order = scenarioTask.order;
        await this.scenarioTasksRepository.save(st);
      }
    }
    return scenario;
  }

  async reset(id: number): Promise<Scenario> {
    const scenario = await this.findScenario(id, { scenarioTasks: true });
    scenario.scenarioTasks.forEach((scenarioTask) => {
      scenarioTask.finishedAt = null;
    });
    scenario.scenarioTasks.sort((a, b) => a.order - b.order);
    await this.scenarioTasksRepository.save(scenario.scenarioTasks);
    return scenario;
  }

  async sendMessage(id: number, scenarioTaskId: number): Promise<void> {
    const scenarioTask = await this.scenarioTasksRepository.findOne({
      where: {
        id: scenarioTaskId,
        scenarioId: id,
      },
      relations: { scenario: true },
    });
    if (!scenarioTask) {
      throw new BadRequestException(`ScenarioTask does not exist`);
    }
    await this.sendLINEMessage(scenarioTask);
  }

  private async findScenario(
    id: number,
    relations?: { scenarioTasks: boolean },
  ): Promise<Scenario> {
    const scenario = await this.scenariosRepository.findOne({
      where: { id },
      relations,
    });
    if (!scenario) {
      throw new NotFoundException();
    }
    return scenario;
  }

  private async sendLINEMessage(scenarioTask: ScenarioTask) {
    const firstTask = scenarioTask.tasks[0];
    if (firstTask && firstTask.type === 'project-notification') {
      const message = this.lineService.createProjectNotificationMessage(
        scenarioTask.scenario.projectId,
        firstTask.text,
        firstTask.joinLabel,
        scenarioTask.id,
      );
      if (firstTask.targets && firstTask.targets.length > 0) {
        const groups = await this.groupsRepository.find({
          where: {
            id: In(firstTask.targets),
          },
          relations: {
            users: true,
          },
        });
        const userIds: number[] = [];
        groups.forEach((group) => {
          group.users.forEach((user) => {
            userIds.push(user.id);
          });
        });
        const lineIds: string[] = await this.getLINEIdFromUserIds(userIds);
        await this.lineService.send(
          message,
          lineIds.filter((t) => t.length === 33), // For debug
        );
      } else {
        await this.lineService.broadcast(message);
      }
    } else {
      const { tasks, lastIndex } = await this.taskService.collectNextTasks(
        scenarioTask.id,
        0,
      );
      const lineMessages: LINEMessage[] = [];
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        if (task.type === 'message') {
          lineMessages.push(this.lineService.createTextMessage(task.text));
        } else if (task.type === 'ques') {
          if (task.dataKey === 'area') {
            const project = await this.projectsRepository.findOne({
              where: { id: scenarioTask.scenario.projectId },
            });
            if (!project) {
              throw new BadRequestException(`Project does not exist`);
            }
            if (!project.setting || !project.setting.groups) {
              throw new BadRequestException(
                'Project is not initialized correctly',
              );
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
              scenarioTask.scenario.projectId,
              scenarioTask.id,
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
              scenarioTask.scenario.projectId,
              scenarioTask.id,
              lastIndex,
            ),
          );
        }
      }

      const projectMembers = await this.projectMembersRepository.find({
        where: { projectId: scenarioTask.scenario.projectId },
        relations: { user: true },
      });
      const userIds: number[] = [];
      projectMembers.forEach((projectMember) => {
        userIds.push(projectMember.user.id);
      });
      const to: string[] = await this.getLINEIdFromUserIds(userIds);
      if (to.length > 0 && lineMessages.length > 0) {
        await this.lineService.send(
          lineMessages,
          to.filter((t) => t.length === 33), // For debug
        );
      }
    }
    scenarioTask.finishedAt = new Date();
    await this.scenarioTasksRepository.save(scenarioTask);
  }

  private async getLINEIdFromUserIds(userIds: number[]): Promise<string[]> {
    const lineUsers = await this.lineUsersRepository.find({
      where: { userId: In(userIds) },
    });
    return lineUsers.map((lu) => lu.id);
  }
}
