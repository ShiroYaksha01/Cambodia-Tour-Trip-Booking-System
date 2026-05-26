import { Controller, Get, UseGuards } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../../shared/enums'

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
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
