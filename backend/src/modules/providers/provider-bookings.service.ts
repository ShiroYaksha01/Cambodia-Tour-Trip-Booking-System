import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provider } from './entities/provider.entity';
import { Booking } from '../bookings/entities/booking.entity';

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
  ) {}

  async findBookingsForProvider(user: JwtUser) {
    if (user.role !== 'provider') {
      throw new ForbiddenException('Only providers can access bookings.');
    }

    const provider = await this.providerRepository.findOne({
      where: { userId: user.userId },
    });

    if (!provider) {
      throw new NotFoundException('Provider profile not found.');
    }

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