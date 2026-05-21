import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { FilterServicesDto } from './dto/filter-services.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { Provider } from '../providers/entities/provider.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
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
      relations: ['provider', 'inventory']
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(createServiceDto: any, userId: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) throw new ForbiddenException('Only providers can create services');

    const service = this.serviceRepository.create({
      ...createServiceDto,
      providerId: provider.id,
    });
    return this.serviceRepository.save(service);
  }

  async patch(id: string, patchServiceDto: any, userId: string) {
    const service = await this.findOne(id);
    const provider = await this.providerRepository.findOne({ where: { userId } });

    if (!provider || service.providerId !== provider.id) {
      throw new ForbiddenException('You do not have permission to update this service');
    }

    await this.serviceRepository.update(id, patchServiceDto);
    return this.findOne(id);
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