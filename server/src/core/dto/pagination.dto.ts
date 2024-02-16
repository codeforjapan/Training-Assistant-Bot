import { IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  page = 1;

  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  limit = 15;

  @IsOptional()
  @IsString({ each: true })
  sort?: string[];
}
