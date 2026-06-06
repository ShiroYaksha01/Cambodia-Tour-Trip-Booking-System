import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { InventoryService } from './inventory.service';
import { Service } from './entities/service.entity';
import { TourPackage } from './entities/tour-package.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Transportation } from './entities/transportation.entity';
import { ServiceInventory } from './entities/service-inventory.entity';
import { InventorySlot } from './entities/inventory-slot.entity';
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
      InventorySlot,
      Provider,
    ]),
    AuthModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService, InventoryService],
  exports: [ServicesService, InventoryService],
})
export class ServicesModule {}