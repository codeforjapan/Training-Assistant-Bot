import { IsNumber, IsOptional } from 'class-validator';

export class CreateDto {
  @IsOptional()
  name?: string;
}

export class UpdateDto {
  @IsOptional()
  name?: string;

  @IsNumber({}, { each: true })
  members!: number[];
}
