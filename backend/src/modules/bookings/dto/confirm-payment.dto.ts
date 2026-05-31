import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsUUID()
  bookingId: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
