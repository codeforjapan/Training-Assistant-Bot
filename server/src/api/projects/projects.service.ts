import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectMembersConfirmation } from '../../entities/project-members-confirmation.entity';
import { ProjectMembersGender } from '../../entities/project-members-gender.entity';
import { ProjectMembersGeneration } from '../../entities/project-members-generation.entity';
import { Report } from '../../entities/report.entity';
import { Scenario } from '../../entities/scenario.entity';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { CreateDto } from './project.dto';
import { ScenarioTemplate } from '../../entities/scenario-template.entity';
import { DateTime } from 'luxon';
import * as AdmZip from 'adm-zip';
import { createReadStream, ReadStream } from 'fs';
import { UtilService } from '../../core/util/util.service';
import { join } from 'path';
import { ProjectMember } from '../../entities/project-member.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectMembersConfirmation)
    private readonly projectMembersConfirmationRepository: Repository<ProjectMembersConfirmation>,
    @InjectRepository(ProjectMembersGender)
    private readonly projectMembersGenderRepository: Repository<ProjectMembersGender>,
    @InjectRepository(ProjectMembersGeneration)
    private readonly projectMembersGenerationRepository: Repository<ProjectMembersGeneration>,
    @InjectRepository(Scenario)
    private readonly scenariosRepository: Repository<Scenario>,
    @InjectRepository(ScenarioTask)
    private readonly scenarioTasksRepository: Repository<ScenarioTask>,
    @InjectRepository(ScenarioTemplate)
    private readonly scenarioTemplatesRepository: Repository<ScenarioTemplate>,
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    private readonly utilService: UtilService,
  ) {}

  async list(): Promise<Project[]> {
    return await this.projectsRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async show(id: number): Promise<Project> {
    return await this.findProject(id, { scenario: true });
  }

  async getStatistic(id: number): Promise<{
    participants: Omit<ProjectMembersConfirmation, 'projectId'>[];
    gender: Omit<ProjectMembersGender, 'projectId'>;
    generation: Omit<ProjectMembersGeneration, 'projectId'>;
  }> {
    const [participants, gender, generation] = await Promise.all([
      this.projectMembersConfirmationRepository.find({
        where: { projectId: id },
        order: { group: 'ASC' },
      }),
      this.projectMembersGenderRepository.findOne({
        where: { projectId: id },
      }),
      this.projectMembersGenerationRepository.findOne({
        where: { projectId: id },
      }),
    ]);
    return {
      participants,
      gender: gender || { man: 0, woman: 0 },
      generation: generation || { u30: 0, u50: 0, u70: 0, o70: 0 },
    };
  }

  async getReports(id: number): Promise<Report[]> {
    const reports = await this.reportsRepository.find({
      where: { projectId: id },
      order: { createdAt: 'DESC' },
    });
    reports.forEach((report) => {
      report.img = report.img ? `/api/reports/${report.id}/img` : undefined;
    });
    return reports;
  }

  async getScenario(id: number): Promise<
    Omit<Scenario, 'scenarioTasks'> & {
      scenarioTasks: Omit<ScenarioTask, 'tasks'>[];
    }
  > {
    const project = await this.findProject(id, { scenario: true });
    const scenario = await this.scenariosRepository.findOne({
      where: { id: project.scenario.id },
      relations: {
        scenarioTasks: true,
      },
      order: {
        scenarioTasks: {
          order: 'ASC',
        },
      },
    });
    const scenarioTasks = scenario.scenarioTasks.map((scenarioTask) => {
      const { tasks, ...rest } = scenarioTask;
      return { ...rest };
    });
    return { ...scenario, scenarioTasks };
  }

  async create(data: CreateDto): Promise<Project> {
    const eventDateStart = DateTime.fromISO(data.eventDateStart, {
      zone: 'Asia/Tokyo',
    })
      .startOf('day')
      .toJSDate();
    const eventDateEnd = DateTime.fromISO(data.eventDateEnd, {
      zone: 'Asia/Tokyo',
    })
      .endOf('day')
      .toJSDate();
    const project = this.projectsRepository.create({
      name: data.name,
      eventDateStart,
      eventDateEnd,
      setting: {
        groups: data.groups || [],
        disableGeneration: data.disableGeneration || false,
        disableGender: data.disableGender || false,
      },
      isDisasterTraining: data.isDisasterTraining,
    });
    const scenario = data.scenarioId
      ? await this.createScenarioFromTemplate(
          data.scenarioId,
          project.setting,
          data.targetGroups,
        )
      : await this.createScenario(
          data.projectScenarioId,
          project.setting,
          data.targetGroups,
        );
    if (!scenario) {
      throw new BadRequestException(`Valid scenario is not found`);
    }
    project.scenario = scenario;
    await this.projectsRepository.manager.transaction(async (manager) => {
      await manager.save(project);
      project.scenario.projectId = project.id;
      await manager.save(project.scenario);
      project.scenario.scenarioTasks.forEach((scenarioTask) => {
        scenarioTask.scenarioId = project.scenario.id;
      });
      await manager.save(project.scenario.scenarioTasks);
    });
    return project;
  }

  async delete(id: number): Promise<void> {
    const project = await this.findProject(id);
    project.isDeleted = true;
    await this.projectsRepository.save(project);
  }

  async exportAsZip(id: number): Promise<ReadStream> {
    const reports = await this.reportsRepository.find({
      where: { projectId: id },
      order: { createdAt: 'DESC' },
    });
    const zip = new AdmZip();
    const data = reports.map((report) => {
      if (report.img) {
        try {
          zip.addLocalFile(
            this.getImgPath(join('original', report.img)),
            'images/',
          );
        } catch (e) {
          report.img = '';
        }
      }
      return [
        `"${report.message}"`,
        report.geom ? report.geom.coordinates[1] : '',
        report.geom ? report.geom.coordinates[0] : '',
        report.img ? `"${report.img}"` : '',
        DateTime.fromJSDate(report.createdAt)
          .setZone('Asia/Tokyo')
          .toFormat('yyyy/LL/dd HH:mm'),
      ].join(',');
    });
    data.unshift(['コメント', '緯度', '経度', '画像', '作成日'].join(','));
    const csv = data.join('\n');
    const zipPath = `/tmp/${Date.now()}.zip`;
    zip.addFile('reports.csv', Buffer.from(csv));
    zip.writeZip(zipPath);
    return createReadStream(zipPath);
  }

  async resetConfirmation(id: number): Promise<void> {
    const project = await this.findProject(id, { projectMembers: true });
    const projectMembers = project.projectMembers || [];
    projectMembers.forEach((projectMember) => {
      projectMember.profile.confirmed = false;
    });
    await this.projectMembersRepository.save(projectMembers);
  }

  private async findProject(
    id: number,
    relations?: {
      scenario?: boolean;
      reports?: boolean;
      projectMembers?: boolean;
    },
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations,
    });
    if (!project) {
      throw new NotFoundException();
    }
    return project;
  }

  private async createScenarioFromTemplate(
    scenarioTemplateId: number,
    setting: {
      groups: string[];
      disableGeneration: boolean;
      disableGender: boolean;
    },
    targetGroups: number[] = [],
  ): Promise<Scenario | undefined> {
    const scenarioTemplate = await this.scenarioTemplatesRepository.findOne({
      where: { id: scenarioTemplateId },
    });
    if (!scenarioTemplate) {
      return undefined;
    }
    const scenario = this.scenariosRepository.create({
      name: scenarioTemplate.name,
      disableReport: scenarioTemplate.disableReport,
    });
    scenario.scenarioTasks = this.getScenarioTasks(
      scenarioTemplate.tasks,
      setting,
      targetGroups,
    );
    return scenario;
  }

  private async createScenario(
    scenarioId: number,
    setting: {
      groups: string[];
      disableGeneration: boolean;
      disableGender: boolean;
    },
    targetGroups: number[] = [],
  ): Promise<Scenario | undefined> {
    const srcScenario = await this.scenariosRepository.findOne({
      where: { id: scenarioId },
      relations: {
        scenarioTasks: true,
      },
    });
    if (!srcScenario) {
      return undefined;
    }
    const scenario = this.scenariosRepository.create({
      name: srcScenario.name,
    });
    scenario.scenarioTasks = this.getScenarioTasks(
      srcScenario.scenarioTasks,
      setting,
      targetGroups,
    );
    return scenario;
  }

  private getScenarioTasks(
    tasks: ScenarioTemplate['tasks'] | ScenarioTask[],
    setting: Project['setting'],
    targetGroups: number[] = [],
  ): ScenarioTask[] {
    return tasks.map((task) => {
      const scenarioTask = this.scenarioTasksRepository.create({
        name: task.name,
        order: task.order,
        tasks: this.filterTasksBySetting(task.tasks, setting),
        isInitial: task.isInitial || false,
      });
      if (task.isInitial && task.tasks[0].type === 'project-notification') {
        task.tasks[0].targets = targetGroups;
      }
      scenarioTask.removable =
        task.removable !== undefined ? task.removable : true;
      return scenarioTask;
    });
  }

  private filterTasksBySetting(
    tasks: Record<string, any>[],
    setting: Project['setting'],
  ) {
    return tasks.filter((task) => {
      const validGroupTask =
        setting.groups.length === 0
          ? !(task.type === 'ques' && task.dataKey === 'group')
          : true;
      const validGenderTask = setting.disableGender
        ? !(task.type === 'ques' && task.dataKey === 'gender')
        : true;
      const validGenerationTask = setting.disableGeneration
        ? !(task.type === 'ques' && task.dataKey === 'generation')
        : true;
      return validGroupTask && validGenderTask && validGenerationTask;
    });
  }

  private getImgPath(filePath: string): string {
    const basePath = this.utilService.getFileStorePath();
    return join(basePath, filePath);
  }
}
