import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { AdminBookingsController } from './admin-bookings.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { PaymentController } from './payment.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { Service } from '../services/entities/service.entity';
import { Provider } from '../providers/entities/provider.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Service, Provider, User])],
  controllers: [BookingsController, AdminBookingsController, AdminDashboardController, PaymentController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
