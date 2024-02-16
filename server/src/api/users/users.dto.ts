import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { VALID_USERNAME_PASSWORD_CHARACTERS } from '../../entities/user.entity';
import { PaginationDto } from '../../core/dto/pagination.dto';

export class ListDto extends PaginationDto {}

export class UpdateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(VALID_USERNAME_PASSWORD_CHARACTERS)
  username?: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}

export class CreateDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(VALID_USERNAME_PASSWORD_CHARACTERS)
  username!: string;

  @IsString()
  @Matches(VALID_USERNAME_PASSWORD_CHARACTERS)
  password!: string;
}
