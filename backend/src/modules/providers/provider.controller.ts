import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ProvidersService } from './providers.service'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { AccountStatus } from '../users/entities/user.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'
import { UserRole } from '../../shared/enums'

@Controller('admin/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ProviderController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  async getProviders(
    @Query('q') q?: string,
    @Query('status') status?: string,
  ) {
    const providers = await this.providersService.getProviders(q, status as AccountStatus)
    return { success: true, data: providers }
  }

  @Post()
  async createProvider(@Body() createProviderDto: CreateProviderDto) {
    const provider = await this.providersService.createProvider(createProviderDto)
    return { success: true, data: provider }
  }

  @Put(':id')
  async updateProvider(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    const provider = await this.providersService.updateProvider(id, updateProviderDto)
    return { success: true, data: provider }
  }

  @Delete(':id')
  async deleteProvider(@Param('id') id: string) {
    await this.providersService.deleteProvider(id)
    return { success: true, data: { id } }
  }
}
