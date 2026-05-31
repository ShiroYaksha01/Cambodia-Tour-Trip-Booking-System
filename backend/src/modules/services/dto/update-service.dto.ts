import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ServiceType, TransportType } from '../../../shared/enums';
import { IsNotInPast } from '../../../common/decorators/is-not-in-past.decorator';

export class UpdateServiceDto {
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @IsOptional()
  @IsEnum(ServiceType, { message: 'Invalid service type' })
  serviceType?: ServiceType;

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

  // --- Inventory Metadata ---
  @IsOptional()
  @IsNumber()
  totalCapacity?: number;

  // --- Tour Metadata ---
  @IsOptional()
  @IsNumber()
  numDays?: number;

  @IsOptional()
  @IsNumber()
  maxPeople?: number;

  @IsOptional()
  @IsDateString()
  @IsNotInPast()
  travelDate?: string;

  @IsOptional()
  @IsDateString()
  @IsNotInPast()
  endDate?: string;

  @IsOptional()
  @IsString()
  departurePoint?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsBoolean()
  includesAccommodation?: boolean;

  @IsOptional()
  @IsBoolean()
  includesTransportation?: boolean;

  @IsOptional()
  @IsBoolean()
  includesMeals?: boolean;

  // --- Accommodation Metadata ---
  @IsOptional()
  @IsString()
  hotelName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  starRating?: number;

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsNumber()
  totalRooms?: number;

  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;

  // --- Transportation Metadata ---
  @IsOptional()
  @IsEnum(TransportType)
  transportType?: TransportType;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsNumber()
  totalSeats?: number;

  @IsOptional()
  @IsDateString()
  @IsNotInPast()
  departureTime?: string;

  @IsOptional()
  @IsDateString()
  arrivalTime?: string;

  @IsOptional()
  @IsString()
  pickupNotes?: string;
}