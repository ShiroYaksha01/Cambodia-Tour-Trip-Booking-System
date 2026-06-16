import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { InventorySlot } from './entities/inventory-slot.entity';
import { Service } from './entities/service.entity';
import { ServiceInventory } from './entities/service-inventory.entity';
import { Provider } from '../providers/entities/provider.entity';
import {
  CreateInventorySlotDto,
  UpdateInventorySlotDto,
  BatchCreateInventorySlotsDto,
} from './dto/inventory-slot.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventorySlot)
    private inventorySlotRepository: Repository<InventorySlot>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(ServiceInventory)
    private serviceInventoryRepository: Repository<ServiceInventory>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  /**
   * Create a single inventory slot for a specific date
   */
  async createSlot(
    serviceId: string,
    dto: CreateInventorySlotDto,
  ): Promise<InventorySlot> {
    // Verify service exists
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    // Check if slot for this date already exists
    const existing = await this.inventorySlotRepository.findOne({
      where: { serviceId, date: dto.date },
    });
    if (existing) {
      throw new BadRequestException(
        `Inventory slot for ${dto.date.toDateString()} already exists`,
      );
    }

    const availableSlots = dto.totalSlots - (dto.bookedSlots || 0);
    const slot = this.inventorySlotRepository.create({
      serviceId,
      date: new Date(dto.date),
      totalSlots: dto.totalSlots,
      bookedSlots: dto.bookedSlots || 0,
      availableSlots,
      price: dto.price,
      status: dto.status || this.computeStatus(availableSlots, dto.totalSlots),
      markupPercentage: dto.markupPercentage || 0,
      isPeakPeriod: dto.isPeakPeriod || false,
    });

    const saved = await this.inventorySlotRepository.save(slot);
    await this.syncServiceInventory(serviceId);
    return saved;
  }

  /**
   * Batch create inventory slots for a date range
   */
  async createBatchSlots(
    serviceId: string,
    dto: BatchCreateInventorySlotsDto,
  ): Promise<InventorySlot[]> {
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const slots: InventorySlot[] = [];
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const existing = await this.inventorySlotRepository.findOne({
        where: { serviceId, date: new Date(date) },
      });

      if (!existing) {
        const slot = this.inventorySlotRepository.create({
          serviceId,
          date: new Date(date),
          totalSlots: dto.dailySlots,
          bookedSlots: 0,
          availableSlots: dto.dailySlots,
          price: dto.basePrice,
          status: 'available',
          markupPercentage: dto.markupPercentage || 0,
          isPeakPeriod: dto.isPeakPeriod || false,
        });
        slots.push(slot);
      }
    }

    const saved = await this.inventorySlotRepository.save(slots);
    if (saved.length > 0) {
      await this.syncServiceInventory(serviceId);
    }
    return saved;
  }

  /**
   * Get inventory slots for a service within a date range
   */
  async getSlotsByDateRange(
    serviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<InventorySlot[]> {
    return this.inventorySlotRepository.find({
      where: {
        serviceId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }

  /**
   * Get a single inventory slot
   */
  async getSlot(slotId: string): Promise<InventorySlot> {
    const slot = await this.inventorySlotRepository.findOne({
      where: { id: slotId },
    });
    if (!slot) {
      throw new NotFoundException(`Inventory slot ${slotId} not found`);
    }
    return slot;
  }

  /**
   * Update an inventory slot — supports date changes, direct availableSlots,
   * and accepts frontend status values ('low' / 'peak') mapping them to DB values.
   */
  async updateSlot(
    slotId: string,
    dto: UpdateInventorySlotDto,
  ): Promise<InventorySlot> {
    const slot = await this.getSlot(slotId);

    // Map frontend-friendly status values to DB enum values
    const rawStatus: string = dto.status as any;
    let mappedStatus: string | undefined = rawStatus;
    if (rawStatus === 'low') mappedStatus = 'low_stock';
    else if (rawStatus === 'peak') mappedStatus = 'peak_demand';

    // If date is changing, check for conflicts on the new date
    if (dto.date) {
      const newDate = new Date(dto.date);
      newDate.setHours(0, 0, 0, 0);
      const conflict = await this.inventorySlotRepository.findOne({
        where: {
          serviceId: slot.serviceId,
          date: newDate,
          id: Not(slotId),
        },
      });
      if (conflict) {
        throw new BadRequestException(
          `Another slot already exists for ${newDate.toDateString()}`,
        );
      }
      slot.date = newDate;
    }

    // availableSlots provided directly by frontend
    if (dto.availableSlots !== undefined) {
      slot.availableSlots = dto.availableSlots;
    }

    if (dto.totalSlots !== undefined) {
      slot.totalSlots = dto.totalSlots;
    }

    if (dto.bookedSlots !== undefined) {
      slot.bookedSlots = dto.bookedSlots;
    }

    // Recompute availableSlots when total or booked changes but no direct availableSlots
    if (
      (dto.totalSlots !== undefined || dto.bookedSlots !== undefined) &&
      dto.availableSlots === undefined
    ) {
      slot.availableSlots = slot.totalSlots - slot.bookedSlots;
    }

    if (dto.price !== undefined) slot.price = dto.price;
    if (dto.markupPercentage !== undefined) slot.markupPercentage = dto.markupPercentage;
    if (dto.isPeakPeriod !== undefined) slot.isPeakPeriod = dto.isPeakPeriod;

    // Auto-compute status if not explicitly provided
    if (mappedStatus) {
      slot.status = mappedStatus as any;
    } else if (dto.totalSlots !== undefined || dto.availableSlots !== undefined) {
      slot.status = this.computeStatus(slot.availableSlots, slot.totalSlots);
    }

    const saved = await this.inventorySlotRepository.save(slot);
    await this.syncServiceInventory(saved.serviceId);
    return saved;
  }

  /**
   * Delete an inventory slot
   */
  async deleteSlot(slotId: string): Promise<void> {
    const slot = await this.getSlot(slotId);
    const serviceId = slot.serviceId;
    await this.inventorySlotRepository.remove(slot);
    await this.syncServiceInventory(serviceId);
  }

  /**
   * Increment booked slots (when booking is confirmed)
   */
  async bookSlots(slotId: string, quantity: number): Promise<InventorySlot> {
    const slot = await this.getSlot(slotId);

    if (slot.availableSlots < quantity) {
      throw new BadRequestException(
        `Not enough available slots. Available: ${slot.availableSlots}, Requested: ${quantity}`,
      );
    }

    slot.bookedSlots += quantity;
    slot.availableSlots -= quantity;
    slot.status = this.computeStatus(slot.availableSlots, slot.totalSlots);

    await this.inventorySlotRepository.save(slot);

    await this.syncServiceInventory(slot.serviceId);

    return slot;
  }

  /**
   * Decrement booked slots (when booking is cancelled)
   */
  async cancelBooking(slotId: string, quantity: number): Promise<InventorySlot> {
    const slot = await this.getSlot(slotId);

    slot.bookedSlots = Math.max(0, slot.bookedSlots - quantity);
    slot.availableSlots = slot.totalSlots - slot.bookedSlots;
    slot.status = this.computeStatus(slot.availableSlots, slot.totalSlots);

    await this.inventorySlotRepository.save(slot);

    await this.syncServiceInventory(slot.serviceId);

    return slot;
  }

  /**
   * Get inventory matrix (all slots) for a service in a date range
   */
  async getInventoryMatrix(
    serviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const slots = await this.getSlotsByDateRange(serviceId, startDate, endDate);

    if (slots.length === 0) {
      throw new NotFoundException(
        `No inventory found for service ${serviceId} in this date range`,
      );
    }

    // Calculate aggregates
    const totalSlots = slots.reduce((sum, s) => sum + s.totalSlots, 0);
    const totalBooked = slots.reduce((sum, s) => sum + s.bookedSlots, 0);
    const avgOccupancy =
      totalSlots > 0
        ? Math.round((totalBooked / totalSlots) * 100)
        : 0;

    const lowStockCount = slots.filter(
      (s) => s.status === 'low_stock',
    ).length;
    const peakDemandCount = slots.filter(
      (s) => s.status === 'peak_demand',
    ).length;

    return {
      serviceId,
      startDate,
      endDate,
      slots,
      aggregates: {
        totalSlots,
        totalBooked,
        totalAvailable: totalSlots - totalBooked,
        avgOccupancy,
        lowStockCount,
        peakDemandCount,
        totalRevenue: slots.reduce(
          (sum, s) => sum + Number(s.dynamicPrice) * s.bookedSlots,
          0,
        ),
      },
    };
  }

  /**
   * Get all services + inventory slots for the authenticated provider
   */
  async getProviderInventory(userId: string) {
    const provider = await this.providerRepository.findOne({ where: { userId } });
    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    const services = await this.serviceRepository.find({
      where: { providerId: provider.id },
      relations: ['inventorySlots'],
      order: { createdAt: 'DESC' },
    });

    return services.map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      price: Number(service.price),
      coverImage: service.coverImage,
      isActive: service.isActive,
      serviceType: service.serviceType,
      slots: (service.inventorySlots || []).map((slot) => ({
        id: slot.id,
        date: slot.date,
        availableSlots: slot.availableSlots,
        totalSlots: slot.totalSlots,
        bookedSlots: slot.bookedSlots,
        price: Number(slot.price),
        status: slot.status,
        markupPercentage: slot.markupPercentage,
        isPeakPeriod: slot.isPeakPeriod,
      })),
    }));
  }

  /**
   * Update pricing engine (batch apply markup to all slots in a date range)
   */
  async applyDynamicPricing(
    serviceId: string,
    startDate: Date,
    endDate: Date,
    markupPercentage: number,
  ): Promise<InventorySlot[]> {
    const slots = await this.getSlotsByDateRange(serviceId, startDate, endDate);

    slots.forEach((slot) => {
      slot.markupPercentage = markupPercentage;
    });

    return this.inventorySlotRepository.save(slots);
  }

  /**
   * Batch set peak period flags
   */
  async setPeakPeriod(
    serviceId: string,
    startDate: Date,
    endDate: Date,
    isPeak: boolean,
  ): Promise<InventorySlot[]> {
    const slots = await this.getSlotsByDateRange(serviceId, startDate, endDate);

    slots.forEach((slot) => {
      slot.isPeakPeriod = isPeak;
      slot.status = isPeak ? 'peak_demand' : 'available';
    });

    return this.inventorySlotRepository.save(slots);
  }

  /**
   * Sync ServiceInventory.bookedCount from all InventorySlot records for a service
   */
  private async syncServiceInventory(serviceId: string): Promise<void> {
    const slots = await this.inventorySlotRepository.find({
      where: { serviceId },
    });

    const totalBooked = slots.reduce((sum, s) => sum + s.bookedSlots, 0);
    const totalCapacity = slots.reduce((sum, s) => sum + s.totalSlots, 0);

    await this.serviceInventoryRepository.upsert(
      {
        serviceId,
        bookedCount: totalBooked,
        totalCapacity,
        isClosed: totalBooked >= totalCapacity && totalCapacity > 0,
      },
      ['serviceId'],
    );
  }

  /**
   * Compute status based on occupancy
   */
  private computeStatus(
    availableSlots: number,
    totalSlots: number,
  ): 'available' | 'low_stock' | 'closed' {
    if (availableSlots <= 0) {
      return 'closed';
    }

    const occupancyPercentage = (1 - availableSlots / totalSlots) * 100;
    if (occupancyPercentage >= 90) {
      return 'low_stock';
    }

    return 'available';
  }
}
