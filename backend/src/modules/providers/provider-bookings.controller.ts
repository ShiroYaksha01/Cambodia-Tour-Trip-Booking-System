import { Controller, Get, Patch, Param, Req, UseGuards, ForbiddenException, Body } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProviderBookingsService } from './provider-bookings.service';
import { ProvidersService } from './providers.service';

@Controller('provider')
export class ProviderBookingsController {
  constructor(
    private readonly providerBookingsService: ProviderBookingsService,
    private readonly providersService: ProvidersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() request: { user: { userId: string } }) {
    return this.providersService.getProviderProfile(request.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Req() request: { user: { userId: string } }, @Body() updateDto: any) {
    return this.providersService.updateProviderProfile(request.user.userId, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bookings')
  findBookings(@Req() request: { user: { userId: string; role: string } }) {
    return this.providerBookingsService.findBookingsForProvider(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('bookings/:id/check-in')
  checkIn(@Param('id') id: string, @Req() request: { user: { userId: string; role: string } }) {
    return this.providerBookingsService.checkInBooking(request.user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard-stats')
  getDashboardStats(@Req() request: { user: { userId: string; role: string } }) {
    return this.providerBookingsService.getDashboardStats(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('inventory-matrix')
  getInventoryMatrix(@Req() request: { user: { userId: string; role: string } }) {
    return this.providerBookingsService.getInventoryMatrix(request.user);
  }

  // Dev-only: return sample bookings for quick local preview
  @Get('bookings/mock')
  getMockBookings() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Mock bookings not available in production');
    }

    const now = new Date()
    return [
      {
        id: 101,
        service_name: 'Angkor Temple Tour',
        user: { id: 11, name: 'Jane Doe', email: 'jane@example.com', phone_number: '+85512345678' },
        quantity: 2,
        date: now.toISOString(),
        payment_status: 'paid',
        amount: 120.0,
      },
      {
        id: 102,
        service_name: 'Phnom Penh City Walk',
        user: { id: 12, name: 'John Smith', email: 'john@example.com' },
        quantity: 1,
        date: new Date(now.getTime() - 86400000).toISOString(),
        payment_status: 'pending',
        amount: 45.0,
      },
    ];
  }
}