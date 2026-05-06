import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ServiceType } from '../../../shared/enums';

export class CreateServiceDto {
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsEnum(ServiceType, { message: 'Invalid service type' })
  serviceType: ServiceType;

  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

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