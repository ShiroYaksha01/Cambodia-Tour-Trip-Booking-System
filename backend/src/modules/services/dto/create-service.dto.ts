import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ServiceType } from '../../../shared/enums';

export class CreateServiceDto {
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

  @IsEnum(ServiceType, { message: 'Invalid service type' })
  serviceType: ServiceType;

  @IsOptional()
  @IsString({ message: 'Destination must be a string' })
  destination?: string;

  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive: boolean;
}