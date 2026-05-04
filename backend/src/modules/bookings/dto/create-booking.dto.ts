import { IsUUID, IsInt, Min, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
