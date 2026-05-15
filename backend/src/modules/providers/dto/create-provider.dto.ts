import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MaxLength } from 'class-validator'
import { AccountStatus } from '../../users/entities/user.entity'

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  companyName: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contactPerson: string

  @IsEmail()
  email: string

  @IsPhoneNumber()
  phoneNumber: string

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  serviceCategory?: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @IsEnum(AccountStatus)
  status: AccountStatus
}
