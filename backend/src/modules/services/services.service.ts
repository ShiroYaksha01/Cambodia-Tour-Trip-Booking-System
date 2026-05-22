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
import { ServiceType } from '../../shared/enums';

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
    private readonly dataSource: DataSource,
  ) {}

  async findAll(filter: FilterServicesDto) {
    const query = this.serviceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.provider', 'provider');

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
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({ 
      where: { id },
      relations: [
        'provider', 
        'inventory', 
        'tourPackage', 
        'accommodation', 
        'transportation', 
        'images'
      ]
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
      });

      // 2. Update specialized metadata
      const type = serviceType || existingService.serviceType;
      
      if (type === ServiceType.TOUR) {
        await queryRunner.manager.upsert(TourPackage, {
          serviceId: id,
          ...(metadata.numDays && { numDays: metadata.numDays }),
          ...(metadata.maxPeople && { maxPeople: metadata.maxPeople }),
          ...(price !== undefined && { basePrice: price }),
          ...(metadata.travelDate && { travelDate: new Date(metadata.travelDate) }),
          ...(metadata.endDate && { endDate: new Date(metadata.endDate) }),
          ...(metadata.departurePoint !== undefined && { departurePoint: metadata.departurePoint || null }),
          ...(metadata.destination !== undefined && { destination: metadata.destination }),
          ...(metadata.includesAccommodation !== undefined && { includesAccommodation: metadata.includesAccommodation }),
          ...(metadata.includesTransportation !== undefined && { includesTransportation: metadata.includesTransportation }),
          ...(metadata.includesMeals !== undefined && { includesMeals: metadata.includesMeals }),
        } as any, ['serviceId']);
      } else if (type === ServiceType.ACCOMMODATION) {
        await queryRunner.manager.upsert(Accommodation, {
          serviceId: id,
          ...(metadata.hotelName && { hotelName: metadata.hotelName }),
          ...(metadata.address !== undefined && { address: metadata.address || null }),
          ...(metadata.starRating !== undefined && { starRating: metadata.starRating }),
          ...(metadata.roomType && { roomType: metadata.roomType }),
          ...(metadata.totalRooms !== undefined && { totalRooms: metadata.totalRooms }),
          ...(price !== undefined && { pricePerNight: price }),
          ...(metadata.checkInTime && { checkInTime: metadata.checkInTime }),
          ...(metadata.checkOutTime && { checkOutTime: metadata.checkOutTime }),
        } as any, ['serviceId']);
      } else if (type === ServiceType.TRANSPORTATION) {
        await queryRunner.manager.upsert(Transportation, {
          serviceId: id,
          ...(metadata.transportType && { transportType: metadata.transportType }),
          ...(metadata.vehicleModel !== undefined && { vehicleModel: metadata.vehicleModel || null }),
          ...(metadata.totalSeats !== undefined && { totalSeats: metadata.totalSeats }),
          ...(price !== undefined && { pricePerSeat: price }),
          ...(metadata.departurePoint !== undefined && { departurePoint: metadata.departurePoint }),
          ...(metadata.destination !== undefined && { destination: metadata.destination }),
          ...(metadata.departureTime && { departureTime: new Date(metadata.departureTime) }),
          ...(metadata.arrivalTime !== undefined && { arrivalTime: metadata.arrivalTime ? new Date(metadata.arrivalTime) : null }),
          ...(metadata.pickupNotes !== undefined && { pickupNotes: metadata.pickupNotes || null }),
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
    return {
      serviceId: id,
      available: true,
    };
  }
}