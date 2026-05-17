import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('accommodations')
export class Accommodation {
  // Shares the same UUID as its parent services row (1-to-1 PK)
  @PrimaryColumn({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'hotel_name', type: 'varchar', length: 200 })
  hotelName: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  // 1–5 stars — CHECK BETWEEN 1 AND 5 enforced at DB level
  @Column({ name: 'star_rating', type: 'smallint', nullable: true })
  starRating: number;

  @Column({ name: 'room_type', type: 'varchar', length: 100, nullable: true })
  roomType: string;

  @Column({ name: 'total_rooms', type: 'smallint', default: 1 })
  totalRooms: number;

  // Detailed price per night
  // (service.price is the flat display price on the card)
  @Column({ name: 'price_per_night', type: 'decimal', precision: 12, scale: 2 })
  pricePerNight: number;

  // e.g. "14:00"
  @Column({ name: 'check_in_time', type: 'time', nullable: true })
  checkInTime: string;

  // e.g. "12:00"
  @Column({ name: 'check_out_time', type: 'time', nullable: true })
  checkOutTime: string;

  // ── Relations ─────────────────────────────────────────────────

  @OneToOne(() => Service, (service) => service.accommodation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}