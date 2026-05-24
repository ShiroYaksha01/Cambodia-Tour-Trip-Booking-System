import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingStatus, PaymentStatus } from '../../shared/enums';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Service } from '../services/entities/service.entity';
import { ServiceInventory } from '../services/entities/service-inventory.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceInventory)
    private readonly inventoryRepository: Repository<ServiceInventory>,
  ) {}

  async createBooking(
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<Booking> {
    const { serviceId, bookingDate, quantity } = createBookingDto;

    const dateObj = new Date(bookingDate);
    if (Number.isNaN(dateObj.getTime()) || dateObj <= new Date()) {
      throw new BadRequestException('Booking date must be in the future');
    }

    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Check inventory availability at booking time
    const inventory = await this.inventoryRepository.findOne({ where: { serviceId } });
    if (!inventory) {
      throw new NotFoundException('Service inventory not found');
    }

    if ((inventory.totalCapacity - inventory.bookedCount) < quantity) {
      throw new BadRequestException('Not enough seats available for the requested quantity');
    }

    // Calculate total price
    const totalAmount = service.price * quantity;
    const transactionId = `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const booking = this.bookingRepository.create({
      userId,
      serviceId,
      providerId: service.providerId,
      bookingDate: dateObj,
      quantity,
      totalAmount,
      bookingStatus: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      transactionId,
    });

    return this.bookingRepository.save(booking);
  }

  async processPayment(bookingId: string, userId: string): Promise<Booking> {
    return this.bookingRepository.manager.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);
      const inventoryRepo = manager.getRepository(ServiceInventory);

      const booking = await bookingRepo.findOne({ where: { id: bookingId, userId } });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.paymentStatus === PaymentStatus.PAID) throw new BadRequestException('Booking is already paid');

      const inventory = await inventoryRepo.findOne({ where: { serviceId: booking.serviceId } });
      if (!inventory) throw new NotFoundException('Service inventory not found');

      if ((inventory.totalCapacity - inventory.bookedCount) < booking.quantity) {
        throw new BadRequestException('Not enough seats available for this booking');
      }

      inventory.bookedCount = inventory.bookedCount + booking.quantity;
      if (inventory.bookedCount >= inventory.totalCapacity) inventory.isClosed = true;
      await inventoryRepo.save(inventory);

      booking.paymentStatus = PaymentStatus.PAID;
      booking.bookingStatus = BookingStatus.CONFIRMED;

      return bookingRepo.save(booking);
    });
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { userId },
      relations: ['service', 'provider'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingById(id: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id, userId },
      relations: ['service', 'provider', 'user'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string, refund = false): Promise<Booking> {
    return this.bookingRepository.manager.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);
      const inventoryRepo = manager.getRepository(ServiceInventory);

      const booking = await bookingRepo.findOne({ where: { id: bookingId, userId } });
      if (!booking) throw new NotFoundException('Booking not found');

      if (booking.bookingStatus === BookingStatus.CANCELLED) {
        return booking;
      }

      // If this booking was paid, release seats back to inventory
      if (booking.paymentStatus === PaymentStatus.PAID) {
        const inventory = await inventoryRepo.findOne({ where: { serviceId: booking.serviceId } });
        if (!inventory) throw new NotFoundException('Service inventory not found');

        inventory.bookedCount = Math.max(0, inventory.bookedCount - booking.quantity);
        if (inventory.bookedCount < inventory.totalCapacity) inventory.isClosed = false;
        await inventoryRepo.save(inventory);

        if (refund) {
          booking.paymentStatus = PaymentStatus.REFUNDED;
        }
      }

      booking.bookingStatus = BookingStatus.CANCELLED;
      return bookingRepo.save(booking);
    });
  }

  async getAdminBookings(q?: string, status?: string, paymentStatus?: string): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.provider', 'provider')
      .orderBy('booking.createdAt', 'DESC');

    if (q) {
      const term = `%${q.toLowerCase()}%`
      query.andWhere(
        '(LOWER(booking.id::text) LIKE :term OR LOWER(user.username) LIKE :term OR LOWER(user.email) LIKE :term OR LOWER(service.title) LIKE :term OR LOWER(provider.companyName) LIKE :term OR LOWER(booking.transactionId) LIKE :term)',
        { term },
      )
    }

    if (status) {
      query.andWhere('booking.bookingStatus = :status', { status })
    }

    if (paymentStatus) {
      query.andWhere('booking.paymentStatus = :paymentStatus', { paymentStatus })
    }

    return query.getMany();
  }

  async getAdminBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'service', 'provider'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async confirmPayment(bookingId: string, transactionId?: string): Promise<Booking> {
    return this.bookingRepository.manager.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);
      const inventoryRepo = manager.getRepository(ServiceInventory);

      const booking = await bookingRepo.findOne({ where: { id: bookingId } });
      if (!booking) throw new NotFoundException('Booking not found');

      const inventory = await inventoryRepo.findOne({ where: { serviceId: booking.serviceId } });
      if (!inventory) throw new NotFoundException('Service inventory not found');

      if ((inventory.totalCapacity - inventory.bookedCount) < booking.quantity) {
        throw new BadRequestException('Not enough seats available for this booking');
      }

      inventory.bookedCount = inventory.bookedCount + booking.quantity;
      if (inventory.bookedCount >= inventory.totalCapacity) inventory.isClosed = true;
      await inventoryRepo.save(inventory);

      booking.paymentStatus = PaymentStatus.PAID;
      if (transactionId) booking.transactionId = transactionId;

      return bookingRepo.save(booking);
    });
  }
}
