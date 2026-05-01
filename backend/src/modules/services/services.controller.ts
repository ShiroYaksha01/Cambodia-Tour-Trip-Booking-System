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
  ParseIntPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { FilterServicesDto } from './dto/filter-services.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

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

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Patch(':id')
  patch(
    @Param('id') id: string,
    @Body() patchServiceDto: UpdateServiceDto,
  ) {
    return this.servicesService.patch(id, patchServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }

  @Get(':id/availability')
  checkAvailability(
    @Param('id') id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.servicesService.checkAvailability(id, query);
  }
}