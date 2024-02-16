import { Module } from '@nestjs/common';
import { ScenarioTemplatesController } from './scenario-templates.controller';
import { ScenarioTemplatesService } from './scenario-templates.service';
import { ScenarioTemplate } from '../../entities/scenario-template.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ScenarioTemplate])],
  controllers: [ScenarioTemplatesController],
  providers: [ScenarioTemplatesService],
})
export class ScenarioTemplatesModule {}
