/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { FilterServicesDto } from './dto/filter-services.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../../shared/enums';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@Query() filter: FilterServicesDto) {
    return this.servicesService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @Req() req: any,
  ) {
    return this.servicesService.create(createServiceDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @Patch(':id')
  patch(
    @Param('id') id: string,
    @Body() patchServiceDto: UpdateServiceDto,
    @Req() req: any,
  ) {
    return this.servicesService.patch(id, patchServiceDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.servicesService.remove(id, req.user.userId);
  }

  @Get(':id/availability')
  checkAvailability(
    @Param('id') id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.servicesService.checkAvailability(id, query);
  }
}