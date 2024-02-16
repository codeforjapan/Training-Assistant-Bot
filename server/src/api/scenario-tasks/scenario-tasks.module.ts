import { Module } from '@nestjs/common';
import { ScenarioTasksController } from './scenario-tasks.controller';
import { ScenarioTasksService } from './scenario-tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenarioTask } from '../../entities/scenario-task.entity';
import { Scenario } from '../../entities/scenario.entity';
import { UtilModule } from '../../core/util/util.module';

@Module({
  imports: [TypeOrmModule.forFeature([ScenarioTask, Scenario])],
  controllers: [ScenarioTasksController],
  providers: [ScenarioTasksService],
})
export class ScenarioTasksModule {}
