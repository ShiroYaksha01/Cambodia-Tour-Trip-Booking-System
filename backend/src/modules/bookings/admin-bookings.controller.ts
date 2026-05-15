import { Controller, Get, Param, Query } from '@nestjs/common'
import { BookingsService } from './bookings.service'

@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

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
