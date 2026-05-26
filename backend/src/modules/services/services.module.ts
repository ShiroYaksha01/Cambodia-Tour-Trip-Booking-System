import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { TourPackage } from './entities/tour-package.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Transportation } from './entities/transportation.entity';
import { ServiceInventory } from './entities/service-inventory.entity';
import { Provider } from '../providers/entities/provider.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      TourPackage,
      Accommodation,
      Transportation,
      ServiceInventory,
      Provider,
    ]),
    AuthModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}