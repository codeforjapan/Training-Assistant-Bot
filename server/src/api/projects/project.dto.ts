import {
  IsBoolean,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  scenarioId: number;

  @IsInt()
  projectScenarioId: number;

  @IsISO8601()
  eventDateStart: string;

  @IsISO8601()
  eventDateEnd: string;

  @IsString({ each: true })
  groups: string[];

  @IsOptional()
  @IsInt({ each: true })
  targetGroups?: number[];

  @IsOptional()
  @IsBoolean()
  disableGender?: boolean;

  @IsOptional()
  @IsBoolean()
  disableGeneration?: boolean;

  @IsOptional()
  @IsBoolean()
  isDisasterTraining?: boolean;
}

export class UpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
