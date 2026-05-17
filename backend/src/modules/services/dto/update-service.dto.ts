import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ServiceType } from '../../../shared/enums';

export class UpdateServiceDto {
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsOptional()
  @IsEnum(ServiceType, { message: 'Invalid service type' })
  serviceType?: ServiceType;

  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  price?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  duration?: string;
}