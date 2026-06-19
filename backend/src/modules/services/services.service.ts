import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Service } from './entities/service.entity';
import { FilterServicesDto } from './dto/filter-services.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Provider } from '../providers/entities/provider.entity';
import { TourPackage } from './entities/tour-package.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Transportation } from './entities/transportation.entity';
import { ServiceInventory } from './entities/service-inventory.entity';
import { InventorySlot } from './entities/inventory-slot.entity';
import { ServiceType } from '../../shared/enums';
import { InventoryService } from './inventory.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(TourPackage)
    private readonly tourRepository: Repository<TourPackage>,
    @InjectRepository(Accommodation)
    private readonly accommodationRepository: Repository<Accommodation>,
    @InjectRepository(Transportation)
    private readonly transportationRepository: Repository<Transportation>,
    @InjectRepository(ServiceInventory)
    private readonly inventoryRepository: Repository<ServiceInventory>,
    @InjectRepository(InventorySlot)
    private readonly inventorySlotRepository: Repository<InventorySlot>,
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter: FilterServicesDto) {
    const query = this.serviceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider')
      .leftJoinAndSelect('service.tourPackage', 'tourPackage')
      .leftJoinAndSelect('service.accommodation', 'accommodation')
      .leftJoinAndSelect('service.transportation', 'transportation')
      .leftJoinAndSelect('service.images', 'images');

    if (filter.serviceType) {
      query.andWhere('service.serviceType = :serviceType', {
        serviceType: filter.serviceType,
      });
    }

    if (filter.minPrice) {
      query.andWhere('service.price >= :minPrice', {
        minPrice: filter.minPrice,
      });
    }

    if (filter.maxPrice) {
      query.andWhere('service.price <= :maxPrice', {
        maxPrice: filter.maxPrice,
      });
    }

    if (filter.isActive !== undefined) {
      query.andWhere('service.isActive = :isActive', {
        isActive: filter.isActive,
      });
    } else {
      query.andWhere('service.isActive = :isActive', {
        isActive: true,
      });
    }

    if (filter.providerId) {
      query.andWhere('service.providerId = :providerId', {
        providerId: filter.providerId,
      });
    }

    if (filter.destination) {
      query.andWhere(
        '(service.location ILIKE :destination OR tourPackage.destination ILIKE :destination OR transportation.destination ILIKE :destination)',
        { destination: `%${filter.destination}%` },
      );
    }

    return query.getMany();
  }

  async findProviderServices(userId: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) throw new ForbiddenException('Provider profile not found');

    return this.serviceRepository.find({
      where: { providerId: provider.id },
      relations: ['provider', 'tourPackage', 'accommodation', 'transportation', 'images'],
    });
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: {
        provider: true,
        inventory: true,
        tourPackage: {
          itineraryDays: {
            activities: true,
          },
        },
        accommodation: true,
        transportation: true,
        images: true,
      },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(createServiceDto: CreateServiceDto, userId: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) throw new ForbiddenException('Only providers can create services');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        serviceType,
        title,
        description,
        price,
        location,
        duration,
        isActive,
        image,
        ...metadata
      } = createServiceDto;

      // 1. Create base service
      const service = queryRunner.manager.create(Service, {
        serviceType,
        title,
        description,
        price,
        location,
        duration,
        coverImage: image,
        isActive: isActive !== undefined ? isActive : true,
        providerId: provider.id,
      });
      const savedService = await queryRunner.manager.save(service);

      // 2. Create specialized metadata
      if (serviceType === ServiceType.TOUR) {
        const tour = queryRunner.manager.create(TourPackage, {
          serviceId: savedService.id,
          numDays: metadata.numDays || 1,
          maxPeople: metadata.maxPeople || 10,
          basePrice: price,
          travelDate: metadata.travelDate ? new Date(metadata.travelDate) : new Date(),
          endDate: metadata.endDate ? new Date(metadata.endDate) : new Date(),
          departurePoint: metadata.departurePoint || null,
          destination: metadata.destination || location,
          includesAccommodation: metadata.includesAccommodation ?? false,
          includesTransportation: metadata.includesTransportation ?? false,
          includesMeals: metadata.includesMeals ?? false,
        } as any);
        await queryRunner.manager.save(tour);
      } else if (serviceType === ServiceType.ACCOMMODATION) {
        const acc = queryRunner.manager.create(Accommodation, {
          serviceId: savedService.id,
          hotelName: metadata.hotelName || title,
          address: metadata.address || location || null,
          starRating: metadata.starRating || 3,
          roomType: metadata.roomType || 'Standard',
          totalRooms: metadata.totalRooms || 1,
          pricePerNight: price,
          checkInTime: metadata.checkInTime || '14:00',
          checkOutTime: metadata.checkOutTime || '12:00',
        } as any);
        await queryRunner.manager.save(acc);
      } else if (serviceType === ServiceType.TRANSPORTATION) {
        const trans = queryRunner.manager.create(Transportation, {
          serviceId: savedService.id,
          transportType: metadata.transportType,
          vehicleModel: metadata.vehicleModel || null,
          totalSeats: metadata.totalSeats || 1,
          pricePerSeat: price,
          departurePoint: metadata.departurePoint || location,
          destination: metadata.destination,
          departureTime: metadata.departureTime ? new Date(metadata.departureTime) : new Date(),
          arrivalTime: metadata.arrivalTime ? new Date(metadata.arrivalTime) : null,
          pickupNotes: metadata.pickupNotes || null,
        } as any);
        await queryRunner.manager.save(trans);
      }

      // 3. Create Inventory
      const totalCapacity = metadata.totalCapacity || 
                            metadata.maxPeople || 
                            metadata.totalRooms || 
                            metadata.totalSeats || 1;
      const inventory = queryRunner.manager.create(ServiceInventory, {
        serviceId: savedService.id,
        totalCapacity,
      });
      await queryRunner.manager.save(inventory);

      await queryRunner.commitTransaction();

      // 4. Auto-generate inventory if requested
      if (createServiceDto.generateInventory) {
        try {
          if (serviceType === ServiceType.TOUR || serviceType === ServiceType.ACCOMMODATION) {
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30);

            await this.inventoryService.createBatchSlots(savedService.id, {
              startDate,
              endDate,
              dailySlots: totalCapacity,
              basePrice: price,
            });
          } else if (serviceType === ServiceType.TRANSPORTATION && metadata.departureTime) {
            await this.inventoryService.createSlot(savedService.id, {
              date: new Date(metadata.departureTime),
              totalSlots: totalCapacity,
              price,
            });
          }
        } catch (inventoryError) {
          console.error('Failed to auto-generate inventory slots:', inventoryError);
          // We don't throw here as the service is already created and committed
        }
      }

      return this.findOne(savedService.id);
      } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async patch(id: string, patchServiceDto: UpdateServiceDto, userId: string) {
    const existingService = await this.findOne(id);
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider || existingService.providerId !== provider.id) {
      throw new ForbiddenException('You do not have permission to update this service');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        serviceType,
        title,
        description,
        price,
        location,
        duration,
        isActive,
        image,
        totalCapacity,
        ...metadata
      } = patchServiceDto;

      // 1. Update base service
      await queryRunner.manager.update(Service, id, {
        ...(serviceType && { serviceType }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(location !== undefined && { location }),
        ...(duration !== undefined && { duration }),
        ...(isActive !== undefined && { isActive }),
        ...(image !== undefined && { coverImage: image }),
      });

      // 2. Update specialized metadata
      const type = serviceType || existingService.serviceType;
      
      if (type === ServiceType.TOUR) {
        const existingTour = existingService.tourPackage || {};
        await queryRunner.manager.upsert(TourPackage, {
          serviceId: id,
          numDays: metadata.numDays ?? existingTour.numDays ?? 1,
          maxPeople: metadata.maxPeople ?? existingTour.maxPeople ?? 10,
          basePrice: price ?? existingTour.basePrice ?? existingService.price,
          travelDate: metadata.travelDate ? new Date(metadata.travelDate) : (existingTour.travelDate ? new Date(existingTour.travelDate) : new Date()),
          endDate: metadata.endDate ? new Date(metadata.endDate) : (existingTour.endDate ? new Date(existingTour.endDate) : new Date()),
          departurePoint: metadata.departurePoint !== undefined ? (metadata.departurePoint || null) : (existingTour.departurePoint ?? null),
          destination: metadata.destination || existingTour.destination || location || existingService.location || 'Unknown',
          includesAccommodation: metadata.includesAccommodation !== undefined ? metadata.includesAccommodation : (existingTour.includesAccommodation ?? true),
          includesTransportation: metadata.includesTransportation !== undefined ? metadata.includesTransportation : (existingTour.includesTransportation ?? true),
          includesMeals: metadata.includesMeals !== undefined ? metadata.includesMeals : (existingTour.includesMeals ?? false),
        } as any, ['serviceId']);
      } else if (type === ServiceType.ACCOMMODATION) {
        const existingAcc = existingService.accommodation || {};
        await queryRunner.manager.upsert(Accommodation, {
          serviceId: id,
          hotelName: metadata.hotelName || existingAcc.hotelName || title || existingService.title,
          address: metadata.address !== undefined ? (metadata.address || null) : (existingAcc.address ?? null),
          starRating: metadata.starRating !== undefined ? metadata.starRating : (existingAcc.starRating ?? 3),
          roomType: metadata.roomType || existingAcc.roomType || 'Standard',
          totalRooms: metadata.totalRooms !== undefined ? metadata.totalRooms : (existingAcc.totalRooms ?? 1),
          pricePerNight: price ?? existingAcc.pricePerNight ?? existingService.price,
          checkInTime: metadata.checkInTime || existingAcc.checkInTime || '14:00',
          checkOutTime: metadata.checkOutTime || existingAcc.checkOutTime || '12:00',
        } as any, ['serviceId']);
      } else if (type === ServiceType.TRANSPORTATION) {
        const existingTrans = existingService.transportation || {};
        await queryRunner.manager.upsert(Transportation, {
          serviceId: id,
          transportType: metadata.transportType || existingTrans.transportType || 'van',
          vehicleModel: metadata.vehicleModel !== undefined ? (metadata.vehicleModel || null) : (existingTrans.vehicleModel ?? null),
          totalSeats: metadata.totalSeats !== undefined ? metadata.totalSeats : (existingTrans.totalSeats ?? 1),
          pricePerSeat: price ?? existingTrans.pricePerSeat ?? existingService.price,
          departurePoint: metadata.departurePoint || existingTrans.departurePoint || location || existingService.location || 'Unknown',
          destination: metadata.destination || existingTrans.destination || 'Unknown',
          departureTime: metadata.departureTime ? new Date(metadata.departureTime) : (existingTrans.departureTime ? new Date(existingTrans.departureTime) : new Date()),
          arrivalTime: metadata.arrivalTime !== undefined ? (metadata.arrivalTime ? new Date(metadata.arrivalTime) : null) : (existingTrans.arrivalTime ? new Date(existingTrans.arrivalTime) : null),
          pickupNotes: metadata.pickupNotes !== undefined ? (metadata.pickupNotes || null) : (existingTrans.pickupNotes ?? null),
        } as any, ['serviceId']);
      }

      // 3. Update Inventory
      if (totalCapacity !== undefined || metadata.maxPeople !== undefined || metadata.totalRooms !== undefined || metadata.totalSeats !== undefined) {
        const newCapacity = totalCapacity || metadata.maxPeople || metadata.totalRooms || metadata.totalSeats;
        await queryRunner.manager.update(ServiceInventory, { serviceId: id }, {
          totalCapacity: newCapacity
        });
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, userId: string) {
    const service = await this.findOne(id);
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider || service.providerId !== provider.id) {
      throw new ForbiddenException('You do not have permission to delete this service');
    }

    return this.serviceRepository.delete(id);
  }

  async checkAvailability(id: string, query: AvailabilityQueryDto) {
    const { date, quantity } = query;
    if (!date) {
      return { serviceId: id, available: true, message: 'Select a date to check specific availability' };
    }
    
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');

    const slot = await this.inventorySlotRepository.findOne({
      where: { serviceId: id, date: dateObj },
    });

    if (!slot) {
      // If no specific slot exists, we assume base service capacity and price
      // but usually we should have slots. For now fallback.
      return {
        serviceId: id,
        date,
        available: true,
        remainingSlots: 99, // Fallback
        price: Number(service.price),
      };
    }

    const price = slot.markupPercentage > 0 
      ? Number(slot.price) * (1 + slot.markupPercentage / 100) 
      : Number(slot.price);

    return {
      serviceId: id,
      date,
      available: slot.availableSlots >= (quantity || 1) && slot.status !== 'closed',
      remainingSlots: slot.availableSlots,
      price: price,
    };
  }
}