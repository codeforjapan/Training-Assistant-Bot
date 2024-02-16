import { IsString, Matches, MinLength } from 'class-validator';
import { VALID_USERNAME_PASSWORD_CHARACTERS } from '../../entities/user.entity';

export class UpdatePasswordDto {
  @IsString()
  @Matches(VALID_USERNAME_PASSWORD_CHARACTERS)
  @MinLength(6)
  password!: string;
}
