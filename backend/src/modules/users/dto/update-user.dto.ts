import { IsOptional, IsEnum, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { AccountStatus } from '../entities/user.entity';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @IsEnum(UserRole)   
  role?: UserRole;
}