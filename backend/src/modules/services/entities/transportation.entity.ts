import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TransportType } from '../../../shared/enums';
import { Service } from './service.entity';

@Entity('transportation')
export class Transportation {
  // Shares the same UUID as its parent services row (1-to-1 PK)
  @PrimaryColumn({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'transport_type', type: 'enum', enum: TransportType })
  transportType: TransportType;

  @Column({ name: 'vehicle_model', type: 'varchar', length: 100, nullable: true })
  vehicleModel: string;

  // CHECK >= 1 enforced at DB level
  @Column({ name: 'total_seats', type: 'smallint' })
  totalSeats: number;

  // Detailed price per seat
  // (service.price is the flat display price on the card)
  @Column({ name: 'price_per_seat', type: 'decimal', precision: 12, scale: 2 })
  pricePerSeat: number;

  @Column({ name: 'departure_point', type: 'text' })
  departurePoint: string;

  @Column({ name: 'destination', type: 'text' })
  destination: string;

  @Column({ name: 'departure_time', type: 'timestamptz' })
  departureTime: Date;

  @Column({ name: 'arrival_time', type: 'timestamptz', nullable: true })
  arrivalTime: Date;

  @Column({ name: 'pickup_notes', type: 'text', nullable: true })
  pickupNotes: string;

  // ── Relations ─────────────────────────────────────────────────

  @OneToOne(() => Service, (service) => service.transportation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}