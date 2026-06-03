import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { BookingStatus, PaymentStatus } from '../../shared/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async getDashboardAnalytics(days: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // 1. Fetch Bookings in range
    const bookings = await this.bookingRepository.find({
      where: { createdAt: Between(startDate, endDate) },
      relations: ['service'],
    });

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.bookingStatus === BookingStatus.COMPLETED);
    const cancelledBookings = bookings.filter(b => b.bookingStatus === BookingStatus.CANCELLED);
    
    // Revenue & Avg Booking Value
    const paidBookings = bookings.filter(b => b.paymentStatus === PaymentStatus.PAID);
    const totalRevenue = paidBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const avgBookingValue = paidBookings.length > 0 ? (totalRevenue / paidBookings.length) : 0;

    // Cancellation Rate
    const cancellationRate = totalBookings > 0 ? (cancelledBookings.length / totalBookings) * 100 : 0;
    
    // Conversion Rate (Mocked for now as we don't track search/view events)
    // We will assume 1 in 12 users who registered/were active made a booking.
    const conversionRate = totalBookings > 0 ? 8.5 : 0; // Using placeholder logic

    // 2. Top Destinations
    const destinationCounts: Record<string, number> = {};
    for (const booking of bookings) {
      if (booking.service && booking.service.location) {
        destinationCounts[booking.service.location] = (destinationCounts[booking.service.location] || 0) + 1;
      }
    }
    
    const topDestinations = Object.entries(destinationCounts)
      .map(([name, count]) => ({ name, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);

    // Calculate percent for top destinations
    const maxDestCount = topDestinations.length > 0 ? topDestinations[0].bookings : 1;
    topDestinations.forEach(d => {
      (d as any).percent = Math.round((d.bookings / maxDestCount) * 100);
    });

    // 3. Category Distribution
    const categoryCounts: Record<string, number> = {};
    for (const booking of bookings) {
      if (booking.service && booking.service.serviceType) {
        categoryCounts[booking.service.serviceType] = (categoryCounts[booking.service.serviceType] || 0) + 1;
      }
    }
    
    const categories = Object.entries(categoryCounts).map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / totalBookings) * 100) || 0
    }));

    return {
      overview: {
        conversionRate: conversionRate.toFixed(1),
        avgBookingValue: avgBookingValue.toFixed(2),
        cancellationRate: cancellationRate.toFixed(1),
      },
      topDestinations,
      categories,
      totalBookings
    };
  }
}
