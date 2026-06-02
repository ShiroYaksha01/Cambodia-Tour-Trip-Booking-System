import { IsDate, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventorySlotDto {
  @Type(() => Date)
  @IsDate({ message: 'date must be a valid date' })
  date: Date;

  @IsNumber()
  totalSlots: number;

  @IsNumber()
  @IsOptional()
  bookedSlots?: number;

  @IsNumber()
  price: number;

  @IsEnum(['available', 'low_stock', 'peak_demand', 'closed'])
  @IsOptional()
  status?: 'available' | 'low_stock' | 'peak_demand' | 'closed';

  @IsNumber()
  @IsOptional()
  markupPercentage?: number;

  @IsBoolean()
  @IsOptional()
  isPeakPeriod?: boolean;
}

export class UpdateInventorySlotDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @IsNumber()
  @IsOptional()
  totalSlots?: number;

  @IsNumber()
  @IsOptional()
  bookedSlots?: number;

  @IsNumber()
  @IsOptional()
  availableSlots?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsEnum(['available', 'low_stock', 'peak_demand', 'closed'])
  @IsOptional()
  status?: 'available' | 'low_stock' | 'peak_demand' | 'closed';

  @IsNumber()
  @IsOptional()
  markupPercentage?: number;

  @IsBoolean()
  @IsOptional()
  isPeakPeriod?: boolean;
}

export class BatchCreateInventorySlotsDto {
  @Type(() => Date)
  @IsDate({ message: 'startDate must be a valid date' })
  startDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'endDate must be a valid date' })
  endDate: Date;

  @IsNumber()
  dailySlots: number;

  @IsNumber()
  basePrice: number;

  @IsNumber()
  @IsOptional()
  markupPercentage?: number;

  @IsBoolean()
  @IsOptional()
  isPeakPeriod?: boolean;
}
