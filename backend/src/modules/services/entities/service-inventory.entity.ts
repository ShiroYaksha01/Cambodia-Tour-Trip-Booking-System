import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_inventory')
export class ServiceInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'total_capacity', type: 'smallint' })
  totalCapacity: number;

  // Incremented on confirmed booking, decremented on cancellation
  @Column({ name: 'booked_count', type: 'smallint', default: 0 })
  bookedCount: number;

  // Auto-set true by trigger when bookedCount >= totalCapacity
  @Column({ name: 'is_closed', type: 'boolean', default: false })
  isClosed: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // ── Computed helper (not stored in DB) ────────────────────────

  get remainingSeats(): number {
    return this.totalCapacity - this.bookedCount;
  }

  // ── Relations ─────────────────────────────────────────────────

  @OneToOne(() => Service, (service) => service.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}