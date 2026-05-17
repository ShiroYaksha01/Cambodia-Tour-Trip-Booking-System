import { IsUUID, IsDateString } from 'class-validator';

export class AvailabilityQueryDto {
  @IsUUID('4', { message: 'Invalid service ID format' })
  serviceId: string;

  @IsDateString({}, { message: 'Start date must be a valid date string' })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate: string;
}