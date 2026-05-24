import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingStatus, PaymentStatus } from '../../shared/enums';
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

  async getRevenueAnalytics(range: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - range);

    // Overview Stats
    const allBookings = await this.bookingRepository.find({
      where: { createdAt: Between(startDate, endDate) }
    });

    const totalRevenue = allBookings
      .filter(b => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const pendingAmount = allBookings
      .filter(b => b.paymentStatus === PaymentStatus.PENDING)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const refundAmount = allBookings
      .filter(b => b.paymentStatus === PaymentStatus.REFUNDED)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const overview = {
      totalRevenue,
      bookingsTotal: allBookings.length,
      bookingsPaid: allBookings.filter(b => b.paymentStatus === PaymentStatus.PAID).length,
      pendingAmount,
      pendingCount: allBookings.filter(b => b.paymentStatus === PaymentStatus.PENDING).length,
      refundAmount,
      refundCount: allBookings.filter(b => b.paymentStatus === PaymentStatus.REFUNDED).length
    };

    // Trend Data
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .select("DATE_TRUNC('day', booking.createdAt)", 'date')
      .addSelect('SUM(booking.totalAmount)', 'value')
      .where('booking.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('booking.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy("DATE_TRUNC('day', booking.createdAt)")
      .orderBy("DATE_TRUNC('day', booking.createdAt)", 'ASC');

    if (range > 90) {
      query.select("DATE_TRUNC('month', booking.createdAt)", 'date')
           .groupBy("DATE_TRUNC('month', booking.createdAt)");
    }

    const rawTrend = await query.getRawMany();
    const trend: { label: string; value: number }[] = rawTrend.map(t => ({
      label: range > 90 
        ? new Date(t.date).toLocaleDateString('en-US', { month: 'short' })
        : new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(t.value)
    }));

    return { overview, trend };
  }

  async getRecentPaidBookings(limit: number) {
    return this.bookingRepository.find({
      where: { paymentStatus: PaymentStatus.PAID },
      relations: ['user', 'service'],
      order: { createdAt: 'DESC' },
      take: limit
    });
  }
}
