import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';
import { ItineraryDay } from './itinerary-day.entity';

@Entity('tour_packages')
export class TourPackage {
  // Shares the same UUID as its parent services row (1-to-1 PK)
  @PrimaryColumn({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'num_days', type: 'smallint' })
  numDays: number;

  // CHECK >= 1 enforced at DB level
  @Column({ name: 'max_people', type: 'smallint' })
  maxPeople: number;

  // Detailed price per person
  // (service.price is the flat display price on the card)
  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
  basePrice: number;

  @Column({ name: 'travel_date', type: 'timestamptz' })
  travelDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({ name: 'departure_point', type: 'text', nullable: true })
  departurePoint: string;

  @Column({ name: 'destination', type: 'text' })
  destination: string;

  @Column({ name: 'includes_accommodation', type: 'boolean', default: true })
  includesAccommodation: boolean;

  @Column({ name: 'includes_transportation', type: 'boolean', default: true })
  includesTransportation: boolean;

  @Column({ name: 'includes_meals', type: 'boolean', default: false })
  includesMeals: boolean;

  // ── Relations ─────────────────────────────────────────────────

  @OneToOne(() => Service, (service) => service.tourPackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @OneToMany(() => ItineraryDay, (day) => day.tourPackage, { cascade: true })
  itineraryDays: ItineraryDay[];
}