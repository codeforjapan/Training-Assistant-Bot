import { IsArray } from 'class-validator';

export class UpdateDto {
  @IsArray()
  scenarioTasks: Record<string, any>[];
}
