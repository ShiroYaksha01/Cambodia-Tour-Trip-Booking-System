import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { AdminBookingsController } from './admin-bookings.controller';
<<<<<<< HEAD
import { AdminDashboardController } from './admin-dashboard.controller';
=======
import { PaymentController } from './payment.controller';
>>>>>>> 05e91c7cedad26aac52e8543ad44910700c128de
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { Service } from '../services/entities/service.entity';
import { Provider } from '../providers/entities/provider.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Service, Provider, User])],
<<<<<<< HEAD
  controllers: [BookingsController, AdminBookingsController, AdminDashboardController],
=======
  controllers: [BookingsController, AdminBookingsController, PaymentController],
>>>>>>> 05e91c7cedad26aac52e8543ad44910700c128de
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
