import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  scenarioId: number;

  @IsNumber()
  order: number;
}
export class UpdateDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  tasks?: Record<string, any>[];
}
