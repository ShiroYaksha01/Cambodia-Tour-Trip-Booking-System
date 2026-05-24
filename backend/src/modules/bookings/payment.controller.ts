import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async processPayment(@Request() req: any, @Body() body: { bookingId: string }) {
    if (!body.bookingId) {
      throw new BadRequestException('Booking ID is required');
    }
    const userId = req.user.userId;
    const booking = await this.bookingsService.processPayment(body.bookingId, userId);
    return {
      success: true,
      data: booking,
    };
  }
}
