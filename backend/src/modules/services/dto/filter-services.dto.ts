import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean } from 'class-validator';
import { ServiceType } from '../../../shared/enums';

export class FilterServicesDto {
  @IsOptional()
  @IsEnum(ServiceType, { message: 'Invalid service type' })
  serviceType?: ServiceType;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum price must be a number' })
  minPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum price must be a number' })
  maxPrice?: number;

  @IsOptional()
  @IsString({ message: 'Destination must be a string' })
  destination?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}