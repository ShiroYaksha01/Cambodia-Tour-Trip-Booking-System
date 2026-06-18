import { IsUUID, IsDateString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilityQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid date string' })
  date?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;
}
