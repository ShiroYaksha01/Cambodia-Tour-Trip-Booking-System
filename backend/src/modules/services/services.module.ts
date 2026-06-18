import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { InventoryController } from './inventory.controller';
import { ServicesService } from './services.service';
import { InventoryService } from './inventory.service';
import { Service } from './entities/service.entity';
import { TourPackage } from './entities/tour-package.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Transportation } from './entities/transportation.entity';
import { ServiceInventory } from './entities/service-inventory.entity';
import { InventorySlot } from './entities/inventory-slot.entity';
import { ServiceImage } from './entities/service-image.entity';
import { ItineraryDay } from './entities/itinerary-day.entity';
import { ItineraryActivity } from './entities/itinerary-activity.entity';
import { Provider } from '../providers/entities/provider.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      TourPackage,
      Accommodation,
      Transportation,
      ServiceInventory,
      InventorySlot,
      ServiceImage,
      ItineraryDay,
      ItineraryActivity,
      Provider,
      User,
    ]),
    AuthModule,
  ],
  controllers: [ServicesController, InventoryController],
  providers: [ServicesService, InventoryService],
  exports: [ServicesService, InventoryService],
})
export class ServicesModule {}