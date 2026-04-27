import { IsUUID, IsInt, Min, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
