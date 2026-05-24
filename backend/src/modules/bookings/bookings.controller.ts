import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async createBooking(@Request() req: any, @Body() createBookingDto: CreateBookingDto) {
    const userId = req.user.userId;
    const booking = await this.bookingsService.createBooking(userId, createBookingDto);
    return {
      success: true,
      data: booking,
    };
  }

  @Post('cancel')
  async cancelBooking(@Request() req: any, @Body() body: { bookingId: string; refund?: boolean }) {
    const userId = req.user.userId;
    const booking = await this.bookingsService.cancelBooking(body.bookingId, userId, !!body.refund);
    return { success: true, data: booking };
  }

  @Get('user')
  async getUserBookings(@Request() req: any) {
    const userId = req.user.userId;
    const bookings = await this.bookingsService.getUserBookings(userId);
    return {
      success: true,
      data: bookings,
    };
  }

  @Get(':id')
  async getBookingById(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    const booking = await this.bookingsService.getBookingById(id, userId);
    return {
      success: true,
      data: booking,
    };
  }

  @Post('payment/success')
  async confirmPayment(@Body() dto: ConfirmPaymentDto) {
    const booking = await this.bookingsService.confirmPayment(dto.bookingId, dto.transactionId);
    return { success: true, data: booking };
  }
}
