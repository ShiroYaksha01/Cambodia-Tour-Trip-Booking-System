import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';
import {
  CreateInventorySlotDto,
  UpdateInventorySlotDto,
  BatchCreateInventorySlotsDto,
} from './dto/inventory-slot.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  /**
   * Get all services + inventory slots for the authenticated provider
   * GET /inventory/provider
   */
  @UseGuards(JwtAuthGuard)
  @Get('provider')
  async getProviderInventory(@Req() req: any) {
    return this.inventoryService.getProviderInventory(req.user.userId);
  }

  /**
   * Create a single inventory slot
   * POST /inventory/:serviceId/slot
   */
  @UseGuards(JwtAuthGuard)
  @Post(':serviceId/slot')
  async createSlot(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateInventorySlotDto,
    @Req() req: any,
  ) {
    return this.inventoryService.createSlot(serviceId, dto);
  }

  /**
   * Batch create inventory slots for a date range
   * POST /inventory/:serviceId/batch
   */
  @UseGuards(JwtAuthGuard)
  @Post(':serviceId/batch')
  async createBatchSlots(
    @Param('serviceId') serviceId: string,
    @Body() dto: BatchCreateInventorySlotsDto,
    @Req() req: any,
  ) {
    return this.inventoryService.createBatchSlots(serviceId, dto);
  }

  /**
   * Get inventory matrix for a service
   * GET /inventory/:serviceId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  @Get(':serviceId')
  async getInventoryMatrix(
    @Param('serviceId') serviceId: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
  ) {
    if (!startDateStr || !endDateStr) {
      throw new BadRequestException(
        'startDate and endDate query params are required (format: YYYY-MM-DD)',
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.inventoryService.getInventoryMatrix(serviceId, startDate, endDate);
  }

  /**
   * Get a single inventory slot
   * GET /inventory/slot/:slotId
   */
  @Get('slot/:slotId')
  async getSlot(@Param('slotId') slotId: string) {
    return this.inventoryService.getSlot(slotId);
  }

  /**
   * Update an inventory slot
   * PUT /inventory/slot/:slotId
   */
  @UseGuards(JwtAuthGuard)
  @Put('slot/:slotId')
  async updateSlot(
    @Param('slotId') slotId: string,
    @Body() dto: UpdateInventorySlotDto,
    @Req() req: any,
  ) {
    return this.inventoryService.updateSlot(slotId, dto);
  }

  /**
   * Delete an inventory slot
   * DELETE /inventory/slot/:slotId
   */
  @UseGuards(JwtAuthGuard)
  @Delete('slot/:slotId')
  async deleteSlot(
    @Param('slotId') slotId: string,
    @Req() req: any,
  ) {
    await this.inventoryService.deleteSlot(slotId);
    return { message: 'Inventory slot deleted successfully' };
  }

  /**
   * Book slots (increment booked count)
   * POST /inventory/slot/:slotId/book
   */
  @UseGuards(JwtAuthGuard)
  @Post('slot/:slotId/book')
  async bookSlots(
    @Param('slotId') slotId: string,
    @Body() body: { quantity: number },
    @Req() req: any,
  ) {
    if (!body.quantity || body.quantity < 1) {
      throw new BadRequestException('quantity must be a positive number');
    }
    return this.inventoryService.bookSlots(slotId, body.quantity);
  }

  /**
   * Cancel booking (decrement booked count)
   * POST /inventory/slot/:slotId/cancel
   */
  @UseGuards(JwtAuthGuard)
  @Post('slot/:slotId/cancel')
  async cancelBooking(
    @Param('slotId') slotId: string,
    @Body() body: { quantity: number },
    @Req() req: any,
  ) {
    if (!body.quantity || body.quantity < 1) {
      throw new BadRequestException('quantity must be a positive number');
    }
    return this.inventoryService.cancelBooking(slotId, body.quantity);
  }

  /**
   * Apply dynamic pricing to a date range
   * PUT /inventory/:serviceId/pricing
   */
  @UseGuards(JwtAuthGuard)
  @Put(':serviceId/pricing')
  async applyDynamicPricing(
    @Param('serviceId') serviceId: string,
    @Body() body: { startDate: string; endDate: string; markupPercentage: number },
    @Req() req: any,
  ) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.inventoryService.applyDynamicPricing(
      serviceId,
      startDate,
      endDate,
      body.markupPercentage,
    );
  }

  /**
   * Set peak period flags for a date range
   * PUT /inventory/:serviceId/peak-period
   */
  @UseGuards(JwtAuthGuard)
  @Put(':serviceId/peak-period')
  async setPeakPeriod(
    @Param('serviceId') serviceId: string,
    @Body() body: { startDate: string; endDate: string; isPeak: boolean },
    @Req() req: any,
  ) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.inventoryService.setPeakPeriod(
      serviceId,
      startDate,
      endDate,
      body.isPeak,
    );
  }
}
