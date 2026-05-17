import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { TourPackage } from './tour-package.entity';
import { ItineraryActivity } from './itinerary-activity.entity';

@Entity('itinerary_days')
@Index(['serviceId', 'dayNumber'], { unique: true })
export class ItineraryDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  // 1 = Day 1, 2 = Day 2, etc.
  @Column({ name: 'day_number', type: 'smallint' })
  dayNumber: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  // ── Relations ─────────────────────────────────────────────────

  @ManyToOne(() => TourPackage, (pkg) => pkg.itineraryDays, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id', referencedColumnName: 'serviceId' })
  tourPackage: TourPackage;

  @OneToMany(() => ItineraryActivity, (activity) => activity.itineraryDay, { cascade: true })
  activities: ItineraryActivity[];
}