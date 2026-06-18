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

  async getPublicProviderById(id: string) {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['services', 'user'],
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return {
      id: provider.id,
      name: provider.companyName,
      location: provider.cityProvince || provider.address || 'Cambodia',
      address: provider.address,
      description: provider.description,
      tagline: provider.tagline,
      websiteUrl: provider.websiteUrl,
      instagramHandle: provider.instagramHandle,
      facebookUrl: provider.facebookUrl,
      telegramUrl: provider.telegramUrl,
      googleMapsLink: provider.googleMapsLink,
      highlights: provider.highlights,
      languages: provider.languages,
      logo: provider.logo,
      coverImage: provider.coverImage,
      isVerified: provider.isVerified,
      email: provider.user?.email,
      phone: provider.user?.phoneNumber,
      services: provider.services.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        location: service.location,
        coverImage: service.coverImage,
        duration: service.duration,
      })),
    };
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
    let provider = await this.providerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!provider) {
      console.log(`Provider profile missing for user ${userId}. Attempting auto-creation.`);
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      provider = this.providerRepository.create({
        userId: user.id,
        companyName: user.username || 'New Provider',
      });
      provider = await this.providerRepository.save(provider);
      // Reload to get relations
      const reloadedProvider = await this.providerRepository.findOne({
        where: { id: provider.id },
        relations: ['user'],
      });
      if (!reloadedProvider) {
        throw new NotFoundException('Failed to retrieve newly created provider profile.');
      }
      return reloadedProvider;
    }

    return provider;
  }

  async updateProviderProfile(userId: string, updateDto: any) {
    const provider = await this.getProviderProfile(userId);

    // Update provider fields
    if (updateDto.companyName) provider.companyName = updateDto.companyName;
    if (updateDto.address) provider.address = updateDto.address;
    if (updateDto.businessAddress) provider.address = updateDto.businessAddress; // Map frontend field
    if (updateDto.description) provider.description = updateDto.description;
    if (updateDto.serviceCategory) provider.serviceCategory = updateDto.serviceCategory;
    if (updateDto.facebookUrl) provider.facebookUrl = updateDto.facebookUrl;
    if (updateDto.telegramUrl) provider.telegramUrl = updateDto.telegramUrl;
    if (updateDto.bankAccountNumber) provider.bankAccountNumber = updateDto.bankAccountNumber;
    if (updateDto.bankName) provider.bankName = updateDto.bankName;
    if (updateDto.refundPolicy) provider.refundPolicy = updateDto.refundPolicy;
    if (updateDto.guestRequirements) provider.guestRequirements = updateDto.guestRequirements;
    if (updateDto.tagline) provider.tagline = updateDto.tagline;
    if (updateDto.websiteUrl) provider.websiteUrl = updateDto.websiteUrl;
    if (updateDto.instagramHandle) provider.instagramHandle = updateDto.instagramHandle;
    if (updateDto.cityProvince) provider.cityProvince = updateDto.cityProvince;
    if (updateDto.googleMapsLink) provider.googleMapsLink = updateDto.googleMapsLink;
    if (updateDto.highlights) provider.highlights = updateDto.highlights;
    if (updateDto.languages) provider.languages = updateDto.languages;
    if (updateDto.coverImage) provider.coverImage = updateDto.coverImage;
    if (updateDto.logo) provider.logo = updateDto.logo;

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
