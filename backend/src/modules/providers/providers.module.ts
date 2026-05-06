import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { ProviderController } from './provider.controller';
import { Booking } from '../bookings/entities/booking.entity';
import { ProviderBookingsController } from './provider-bookings.controller';
import { ProviderBookingsService } from './provider-bookings.service';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Booking, Service, User])],
  controllers: [ProviderController, ProviderBookingsController],
  providers: [ProviderBookingsService],
  exports: [TypeOrmModule],
})
export class ProvidersModule {}
