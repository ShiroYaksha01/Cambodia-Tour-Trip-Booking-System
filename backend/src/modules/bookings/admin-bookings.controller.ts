import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../../shared/enums'

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('revenue-stats')
  async getRevenueStats(@Query('range') range?: string) {
    const stats = await this.bookingsService.getRevenueAnalytics(parseInt(range || '30'))
    return {
      success: true,
      data: stats,
    }
  }

  @Get('recent-paid')
  async getRecentPaid(@Query('limit') limit?: string) {
    const bookings = await this.bookingsService.getRecentPaidBookings(parseInt(limit || '10'))
    return {
      success: true,
      data: bookings,
    }
  }

  @Get()
  async getBookings(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    const bookings = await this.bookingsService.getAdminBookings(q, status, paymentStatus)
    return {
      success: true,
      data: bookings,
    }
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string) {
    const booking = await this.bookingsService.getAdminBookingById(id)
    return {
      success: true,
      data: booking,
    }
  }
}
