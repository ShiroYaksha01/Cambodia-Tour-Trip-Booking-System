import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { Service } from '../services/entities/service.entity';
import { Provider } from '../providers/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Service, Provider])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
