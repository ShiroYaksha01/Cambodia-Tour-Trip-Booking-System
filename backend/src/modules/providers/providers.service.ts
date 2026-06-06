import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Provider } from './entities/provider.entity'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { UsersService } from '../users/users.service'
import { Service } from '../services/entities/service.entity'
import { AccountStatus } from '../users/entities/user.entity'
import { UserRole } from '../users/entities/user.entity'

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly usersService: UsersService,
  ) {}

  async getProviders(search?: string, status?: AccountStatus) {
    const query = this.providerRepository
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.user', 'user')
      .loadRelationCountAndMap('provider.totalServices', 'provider.services')
      .orderBy('provider.createdAt', 'DESC')

    if (search) {
      const term = `%${search.toLowerCase()}%`
      query.andWhere(
        '(LOWER(provider.companyName) LIKE :term OR LOWER(user.username) LIKE :term OR LOWER(user.email) LIKE :term OR LOWER(provider.serviceCategory) LIKE :term)',
        { term },
      )
    }

    if (status) {
      query.andWhere('user.status = :status', { status })
    }

    const providers = await query.getMany()

    return providers.map((provider) => ({
      id: provider.id,
      companyName: provider.companyName,
      contactPerson: provider.user?.username || '',
      email: provider.user?.email || '',
      phoneNumber: provider.user?.phoneNumber || '',
      address: provider.address || '',
      serviceCategory: provider.serviceCategory || '',
      description: provider.description || '',
      status: provider.user?.status || AccountStatus.INACTIVE,
      totalServices: (provider as any).totalServices ?? 0,
      userId: provider.userId,
    }))
  }

  async createProvider(createProviderDto: CreateProviderDto) {
    const existingUser = await this.usersService.findByEmail(createProviderDto.email)
    if (existingUser) {
      throw new BadRequestException('A provider with this email already exists')
    }

    const passwordHash = await bcrypt.hash('Welcome@123', 10)

    const user = await this.usersService.create({
      username: createProviderDto.contactPerson,
      email: createProviderDto.email,
      phoneNumber: createProviderDto.phoneNumber,
      role: UserRole.PROVIDER,
      status: createProviderDto.status,
      passwordHash,
    })

    const provider = this.providerRepository.create({
      userId: user.id,
      companyName: createProviderDto.companyName,
      address: createProviderDto.address,
      serviceCategory: createProviderDto.serviceCategory,
      description: createProviderDto.description,
    })

    const savedProvider = await this.providerRepository.save(provider)

    return {
      id: savedProvider.id,
      companyName: savedProvider.companyName,
      contactPerson: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: savedProvider.address,
      serviceCategory: savedProvider.serviceCategory,
      description: savedProvider.description,
      status: savedProvider.user?.status || createProviderDto.status,
      totalServices: 0,
      userId: savedProvider.userId,
    }
  }

  async updateProvider(id: string, updateProviderDto: UpdateProviderDto) {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!provider) {
      throw new NotFoundException('Provider not found')
    }

    if (updateProviderDto.email && updateProviderDto.email !== provider.user.email) {
      const existingUser = await this.usersService.findByEmail(updateProviderDto.email)
      if (existingUser && existingUser.id !== provider.userId) {
        throw new BadRequestException('Email already in use')
      }
    }

    if (updateProviderDto.companyName !== undefined) {
      provider.companyName = updateProviderDto.companyName
    }
    if (updateProviderDto.address !== undefined) {
      provider.address = updateProviderDto.address
    }
    if (updateProviderDto.serviceCategory !== undefined) {
      provider.serviceCategory = updateProviderDto.serviceCategory
    }
    if (updateProviderDto.description !== undefined) {
      provider.description = updateProviderDto.description
    }

    await this.providerRepository.save(provider)

    await this.usersService.updateUser(provider.userId, {
      username: updateProviderDto.contactPerson,
      email: updateProviderDto.email,
      phoneNumber: updateProviderDto.phoneNumber,
      status: updateProviderDto.status,
    })

    const updatedUser = await this.usersService.findById(provider.userId)

    return {
      id: provider.id,
      companyName: provider.companyName,
      contactPerson: updatedUser.username,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      address: provider.address,
      serviceCategory: provider.serviceCategory,
      description: provider.description,
      status: updatedUser.status,
      totalServices: await this.serviceRepository.count({ where: { providerId: provider.id } }),
      userId: provider.userId,
    }
  }

  async deleteProvider(id: string) {
    const target = await this.providerRepository.findOne({ where: { id } })
    if (!target) {
      throw new NotFoundException('Provider not found')
    }

    await this.providerRepository.delete(id)
    return { deleted: true }
  }

  async getProviderProfile(userId: string) {
    const provider = await this.providerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    return provider;
  }

  async updateProviderProfile(userId: string, updateDto: any) {
    const provider = await this.providerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    // Update provider fields
    if (updateDto.companyName) provider.companyName = updateDto.companyName;
    if (updateDto.address) provider.address = updateDto.address;
    if (updateDto.description) provider.description = updateDto.description;
    if (updateDto.serviceCategory) provider.serviceCategory = updateDto.serviceCategory;

    // Update user fields
    if (updateDto.email || updateDto.phoneNumber || updateDto.username) {
      await this.usersService.updateUser(userId, {
        email: updateDto.email,
        phoneNumber: updateDto.phoneNumber,
        username: updateDto.username,
      });
    }

    return this.providerRepository.save(provider);
  }
}
