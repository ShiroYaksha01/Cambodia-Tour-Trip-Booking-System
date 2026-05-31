import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../shared/enums';
import { UsersService } from '../users/users.service';
import { AccountStatus } from '../users/entities/user.entity';

/**
 * All routes here are under /admin
 * e.g. GET  /admin/users
 *      PATCH /admin/users/:id/status
 *
 * Keeping admin routes in their own controller avoids the conflict
 * where GET /users/:id would swallow GET /users/admin/users.
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private usersService: UsersService) {}

  /**
   * GET /admin/users
   * Returns all users with id, email, role, status, createdAt
   */
  @Get('users')
  getUsers() {
    return this.usersService.findAllForAdmin();
  }

  /**
   * PATCH /admin/users/:id/status
   * Body: { status: 'active' | 'inactive' | 'suspended' }
   */
  @Patch('users/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.usersService.updateUser(id, { status });
  }
}