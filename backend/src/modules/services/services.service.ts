import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { FilterServicesDto } from './dto/filter-services.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async findAll(filter: FilterServicesDto) {
    const query = this.serviceRepository.createQueryBuilder('service');

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

  async findOne(id: number) {
    return this.serviceRepository.findOne({ where: { id } });
  }

  async create(createServiceDto: any) {
    const service = this.serviceRepository.create(createServiceDto);
    return this.serviceRepository.save(service);
  }

  async patch(id: number, patchServiceDto: any) {
    await this.serviceRepository.update(id, patchServiceDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.serviceRepository.delete(id);
  }

  async checkAvailability(id: string, query: AvailabilityQueryDto) {
    return {
      serviceId: id,
      available: true,
    };
  }
}

