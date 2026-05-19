import { Controller, Get } from '@nestjs/common'
import { BookingsService } from './bookings.service'

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async getDashboard() {
    return this.bookingsService.getAdminDashboard()
  }

  @Get('summary')
  async getSummary() {
    const summary = await this.bookingsService.getAdminDashboardSummary()
    return {
      success: true,
      data: summary,
    }
  }
}
