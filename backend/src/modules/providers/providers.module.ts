import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Provider } from './entities/provider.entity';
import { ProviderController } from './provider.controller';
import { PublicProvidersController } from './public-provider.controller';
import { ProvidersService } from './providers.service';
import { UsersModule } from '../users/users.module';
import { Service } from '../services/entities/service.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ProviderBookingsController } from './provider-bookings.controller';
import { ProviderBookingsService } from './provider-bookings.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Booking, Service, User]), UsersModule],
  controllers: [ProviderController, ProviderBookingsController, PublicProvidersController],
  providers: [ProvidersService, ProviderBookingsService],
  exports: [ProvidersService, ProviderBookingsService],
})
export class ProvidersModule {}


