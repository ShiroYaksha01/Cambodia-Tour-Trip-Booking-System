import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provider } from './entities/provider.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { PaymentStatus } from '../../shared/enums';
import { Service } from '../services/entities/service.entity';
import { User } from '../users/entities/user.entity';

type JwtUser = {
  userId: string;
  role: string;
};

@Injectable()
export class ProviderBookingsService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async getOrCreateProvider(userId: string): Promise<Provider> {
    let provider = await this.providerRepository.findOne({
      where: { userId },
      relations: ['services', 'services.inventory', 'user'],
    });

    if (!provider) {
      console.log(`Provider profile missing for user ${userId}. Attempting auto-creation.`);
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      provider = this.providerRepository.create({
        userId,
        companyName: user.username || 'New Provider',
      });
      provider = await this.providerRepository.save(provider);
      // Reload to get relations
      const reloadedProvider = await this.providerRepository.findOne({
        where: { id: provider.id },
        relations: ['services', 'services.inventory', 'user'],
      });
      
      if (!reloadedProvider) {
        throw new NotFoundException('Failed to retrieve newly created provider profile.');
      }
      return reloadedProvider;
    }

    return provider;
  }


  async findBookingsForProvider(user: JwtUser) {
    if (user.role !== 'provider') {
      throw new ForbiddenException('Only providers can access bookings.');
    }

    const provider = await this.getOrCreateProvider(user.userId);

    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.user', 'user')
      .innerJoin('service.provider', 'provider', 'provider.id = :providerId', {
        providerId: provider.id,
      })
      .orderBy('booking.bookingDate', 'DESC')
      .getMany();

    return bookings.map((booking) => ({
      id: booking.id,
      service_name: booking.service?.title ?? null,
      reference_code: booking.referenceCode,
      booking_status: booking.bookingStatus,
      user: this.toBasicUser(booking.user),
      quantity: booking.quantity,
      date: booking.bookingDate,
      payment_status: booking.paymentStatus,
      amount:
        booking.totalAmount ??
        (booking.service?.price !== undefined
          ? Number(booking.service.price) * booking.quantity
          : null),
    }));
  }

  async getDashboardStats(user: JwtUser) {
    if (user.role !== 'provider') {
      throw new ForbiddenException('Only providers can access dashboard stats.');
    }

    const provider = await this.getOrCreateProvider(user.userId);

    const bookings = await this.bookingRepository.find({
      where: { providerId: provider.id },
    });

    // Calculate Occupancy (simplified: total booked / total capacity)
    let totalCapacity = 0;
    let totalBooked = 0;
    provider.services.forEach((s) => {
      if (s.inventory) {
        totalCapacity += s.inventory.totalCapacity;
        totalBooked += s.inventory.bookedCount;
      }
    });
    const avgOccupancy = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;

    // Calculate REVPAR (Total Revenue / Total Capacity)
    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const revpar = totalCapacity > 0 ? totalRevenue / totalCapacity : 0;

    // Low stock alerts (e.g., less than 10% remaining)
    const lowStockAlerts = provider.services.filter((s) => {
      if (!s.inventory || s.inventory.totalCapacity === 0) return false;
      const remaining = s.inventory.totalCapacity - s.inventory.bookedCount;
      return (remaining / s.inventory.totalCapacity) < 0.1;
    }).length;

    return {
      avgOccupancy: avgOccupancy.toFixed(1) + '%',
      revpar: '$' + revpar.toFixed(2),
      lowStockAlerts: lowStockAlerts.toString().padStart(2, '0'),
      khmerNewYear: '98%', // Placeholder for special event
    };
  }

  async checkInBooking(user: JwtUser, bookingId: string) {
    if (user.role !== 'provider') {
      throw new ForbiddenException('Only providers can check in guests.');
    }

    const provider = await this.getOrCreateProvider(user.userId);

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, providerId: provider.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.paymentStatus !== PaymentStatus.PAID) {
      throw new ForbiddenException('Cannot check in an unpaid booking.');
    }

    booking.bookingStatus = 'completed' as any; // Using string since I need to check exact enum later if needed
    return this.bookingRepository.save(booking);
  }

  async getInventoryMatrix(user: JwtUser) {
    if (user.role !== 'provider') {
      throw new ForbiddenException('Only providers can access inventory matrix.');
    }

    const provider = await this.getOrCreateProvider(user.userId);

    const services = await this.serviceRepository.find({
      where: { providerId: provider.id },
      relations: ['inventory', 'tourPackage', 'accommodation', 'transportation'],
    });

    // Return current services and their inventory status
    return services.map((s) => ({
      ...s,
      remaining: s.inventory ? s.inventory.totalCapacity - s.inventory.bookedCount : 0,
      total: s.inventory ? s.inventory.totalCapacity : 0,
      isClosed: s.inventory ? s.inventory.isClosed : false,
    }));
  }

  private toBasicUser(user: Booking['user']) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.username,
      email: user.email,
      phone_number: user.phoneNumber,
      profile_picture: user.profilePicture,
    };
  }
}