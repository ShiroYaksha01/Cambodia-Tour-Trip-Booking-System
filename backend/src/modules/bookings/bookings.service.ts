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
import { ServiceInventory } from '../services/entities/service-inventory.entity';
import { InventorySlot } from '../services/entities/inventory-slot.entity';
import { Provider } from '../providers/entities/provider.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceInventory)
    private readonly serviceInventoryRepository: Repository<ServiceInventory>,
    @InjectRepository(InventorySlot)
    private readonly inventorySlotRepository: Repository<InventorySlot>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const referenceCode = Math.random().toString(36).substring(2, 8).toUpperCase();

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
      referenceCode,
    });

    return this.bookingRepository.save(booking);
  }

  async processPayment(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Booking is already paid');
    }

    booking.paymentStatus = PaymentStatus.PAID;
    booking.bookingStatus = BookingStatus.CONFIRMED;
    await this.bookingRepository.save(booking);

    await this.deductInventoryForBooking(booking);

    return booking;
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

  async getAdminDashboard() {
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      paidTotals,
    ] = await Promise.all([
      this.userRepository.count(),
      this.providerRepository.count(),
      this.bookingRepository.count(),
      this.bookingRepository
        .createQueryBuilder('booking')
        .leftJoin('booking.provider', 'provider')
        .select('COALESCE(SUM(booking.totalAmount), 0)', 'total_revenue')
        .addSelect(
          'COALESCE(SUM(booking.totalAmount * COALESCE(provider.commissionRate, 10) / 100), 0)',
          'total_platform_fee',
        )
        .where('booking.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
        .getRawOne<{ total_revenue: string; total_platform_fee: string }>(),
    ]);

    return {
      total_users: totalUsers,
      total_providers: totalProviders,
      total_bookings: totalBookings,
      total_revenue: Number(paidTotals?.total_revenue || 0),
      total_platform_fee: Number(paidTotals?.total_platform_fee || 0),
    };
  }

  async getAdminDashboardSummary() {
    const totalBookings = await this.bookingRepository.count();

    const totalProviders = await this.providerRepository.count();
    const totalUsers = await this.userRepository.count();
    const totalServices = await this.serviceRepository.count();
    const verifiedProviders = await this.providerRepository.count({ where: { isVerified: true } });

    const statusRows = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.bookingStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('booking.bookingStatus')
      .getRawMany<{ status: BookingStatus; count: string }>();

    const statusBreakdown = Object.values(BookingStatus).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<BookingStatus, number>,
    );

    for (const row of statusRows) {
      statusBreakdown[row.status] = Number(row.count || 0);
    }

    const recentBookings = await this.bookingRepository.find({
      relations: ['user', 'service', 'provider'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const monthStarts = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - (5 - index));
      return date;
    });

    const monthlyRows = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("TO_CHAR(DATE_TRUNC('month', booking.createdAt), 'YYYY-MM')", 'monthKey')
      .addSelect('COUNT(*)', 'bookings')
      .addSelect('COALESCE(SUM(booking.totalAmount), 0)', 'revenue')
      .where('booking.createdAt >= :startDate', { startDate: monthStarts[0] })
      .groupBy("DATE_TRUNC('month', booking.createdAt)")
      .orderBy("DATE_TRUNC('month', booking.createdAt)", 'ASC')
      .getRawMany<{ monthKey: string; bookings: string; revenue: string }>();

    const monthlyStatsByKey = new Map(
      monthlyRows.map((row) => [
        row.monthKey,
        {
          bookings: Number(row.bookings || 0),
          revenue: Number(row.revenue || 0),
        },
      ]),
    );

    const monthlyStats = monthStarts.map((date) => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const stats = monthlyStatsByKey.get(monthKey);

      return {
        month: date.toLocaleString('en-US', { month: 'short' }),
        bookings: stats?.bookings ?? 0,
        revenue: stats?.revenue ?? 0,
      };
    });

    const paidPaymentCount = await this.bookingRepository.count({
      where: { paymentStatus: PaymentStatus.PAID },
    });

    const paidTotals = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.provider', 'provider')
      .select('COALESCE(SUM(booking.totalAmount), 0)', 'total_revenue')
      .addSelect(
        'COALESCE(SUM(booking.totalAmount * COALESCE(provider.commissionRate, 10) / 100), 0)',
        'total_platform_fee',
      )
      .where('booking.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })
      .getRawOne<{ total_revenue: string; total_platform_fee: string }>();

    return {
      stats: {
        totalBookings,
        totalRevenue: Number(paidTotals?.total_revenue || 0),
        totalProviders,
        totalUsers,
        totalServices,
        verifiedProviders,
        paidPaymentCount,
        totalPlatformFee: Number(paidTotals?.total_platform_fee || 0),
      },
      statusBreakdown,
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        customerName: b.user?.username || 'Guest',
        customerEmail: b.user?.email || 'N/A',
        serviceTitle: b.service?.title || 'Unknown Tour',
        providerName: b.provider?.companyName || 'Unknown Provider',
        amount: b.totalAmount,
        status: b.bookingStatus,
        date: b.bookingDate,
        transactionId: b.transactionId,
        createdAt: b.createdAt,
      })),
      monthlyStats,
    };
  }

  async confirmPayment(bookingId: string, transactionId?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    booking.paymentStatus = PaymentStatus.PAID;
    if (transactionId) booking.transactionId = transactionId;
    await this.bookingRepository.save(booking);

    await this.deductInventoryForBooking(booking);

    return booking;
  }

  private async deductInventoryForBooking(booking: Booking): Promise<void> {
    try {
      const bookingDate = new Date(booking.bookingDate);
      bookingDate.setHours(0, 0, 0, 0);

      const slot = await this.inventorySlotRepository.findOne({
        where: {
          serviceId: booking.serviceId,
          date: bookingDate,
        },
      });

      if (slot) {
        const available = slot.availableSlots - booking.quantity;
        slot.bookedSlots += booking.quantity;
        slot.availableSlots = Math.max(0, available);
        slot.status = available <= 0 ? 'closed' : available / slot.totalSlots < 0.1 ? 'low_stock' : 'available';
        await this.inventorySlotRepository.save(slot);
      }

      const allSlots = await this.inventorySlotRepository.find({
        where: { serviceId: booking.serviceId },
      });
      const totalBooked = allSlots.reduce((sum, s) => sum + s.bookedSlots, 0);
      const totalCapacity = allSlots.reduce((sum, s) => sum + s.totalSlots, 0);

      await this.serviceInventoryRepository.upsert(
        {
          serviceId: booking.serviceId,
          bookedCount: totalBooked,
          totalCapacity,
          isClosed: totalBooked >= totalCapacity && totalCapacity > 0,
        },
        ['serviceId'],
      );
    } catch (err) {
      console.error('Failed to deduct inventory for booking:', err);
    }
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