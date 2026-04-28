import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ServiceType } from '../../../shared/enums';

export class UpdateServiceDto {
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
  @IsEnum(ServiceType, { message: 'Invalid service type' })
  serviceType?: ServiceType;

  @IsOptional()
  @IsString({ message: 'Destination must be a string' })
  destination?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}