import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async createBooking(
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    const { serviceId, bookingDate, quantity } = createBookingDto;

    // Validate booking date is in the future
    const dateObj = new Date(bookingDate);
    if (Number.isNaN(dateObj.getTime()) || dateObj <= new Date()) {
      throw new BadRequestException('Booking date must be in the future');
    }

    // Validate service exists
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Calculate total price
    const totalPrice = service.price * quantity;

    // Save booking
    const booking = this.bookingRepository.create({
      userId,
      serviceId,
      providerId: service.providerId,
      bookingDate: dateObj,
      quantity,
      totalPrice,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    // Return all bookings mapped with some useful relation data to support frontend details
    return this.bookingRepository.find({
      where: { userId },
      relations: ['service'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingById(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, userId },
      relations: ['service', 'provider'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
