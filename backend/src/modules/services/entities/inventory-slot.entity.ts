import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('inventory_slots')
@Unique(['serviceId', 'date'])
export class InventorySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  // Date for this slot (YYYY-MM-DD format stored as DATE)
  @Column({ name: 'date', type: 'date' })
  date: Date;

  // Number of available slots for this day
  @Column({ name: 'available_slots', type: 'smallint' })
  availableSlots: number;

  // Total slots for this day (capacity)
  @Column({ name: 'total_slots', type: 'smallint' })
  totalSlots: number;

  // Booked count for this day
  @Column({ name: 'booked_slots', type: 'smallint', default: 0 })
  bookedSlots: number;

  // Price per unit for this day
  @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
  price: number;

  // Status: available, low_stock, peak_demand, closed
  @Column({
    name: 'status',
    type: 'enum',
    enum: ['available', 'low_stock', 'peak_demand', 'closed'],
    default: 'available',
  })
  status: 'available' | 'low_stock' | 'peak_demand' | 'closed';

  // Markup percentage for dynamic pricing (e.g., 25 = 25%)
  @Column({ name: 'markup_percentage', type: 'smallint', default: 0 })
  markupPercentage: number;

  // Is this day a peak demand period (e.g., Khmer New Year)
  @Column({ name: 'is_peak_period', type: 'boolean', default: false })
  isPeakPeriod: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ── Relations ─────────────────────────────────────────────────

  @ManyToOne(() => Service, (service) => service.inventorySlots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  // ── Computed helpers (not stored in DB) ────────────────────────

  get occupancyPercentage(): number {
    if (this.totalSlots === 0) return 0;
    return Math.round((this.bookedSlots / this.totalSlots) * 100);
  }

  get dynamicPrice(): number {
    const basePrice = Number(this.price);
    if (this.markupPercentage > 0) {
      return basePrice * (1 + this.markupPercentage / 100);
    }
    return basePrice;
  }
}
