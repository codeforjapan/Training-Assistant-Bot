import { Module } from '@nestjs/common';
import { UtilService } from './util.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { TaskService } from './task.service';
import { LineService } from './line.service';
import { Project } from '../../entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScenarioTask, Project])],
  providers: [UtilService, TaskService, LineService],
  exports: [UtilService, TaskService, LineService],
})
export class UtilModule {}
