import {
  ArrayMaxSize,
  ArrayMinSize,
  IsIn,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../core/dto/pagination.dto';
import { Transform } from 'class-transformer';
import { Point } from 'geojson';

export class ListDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  projectId?: number;
}

export class SearchDto {
  @IsOptional()
  @IsNumber()
  projectId?: number;

  @IsOptional()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsNumber({}, { each: true })
  extends: number[];

  @IsIn(['list', 'geojson'])
  @IsOptional()
  responseType = 'list';
}

export class ReportImageDto {
  @IsOptional()
  @IsIn(['original', 'thumbnail'])
  type: 'original' | 'thumbnail' = 'thumbnail';
}

export class UpdateDto {
  @IsObject()
  geom: { lat: number; lon: number };
}

export class CreateViaProjectDto {
  @IsString()
  @IsOptional()
  message?: string;

  @IsObject()
  @IsOptional()
  geom?: Point;
}

export class ExportDto {
  @IsOptional()
  @IsPositive({ each: true })
  ids?: number[];

  @IsISO8601()
  start!: string;

  @IsISO8601()
  end!: string;

  @IsOptional()
  @Transform(({ value }) => value.split(',').map((n) => parseFloat(n)))
  @IsNumber({}, { each: true })
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  area?: number[];
}
