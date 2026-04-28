import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ItineraryDay } from './itinerary-day.entity';

@Entity('itinerary_activities')
export class ItineraryActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'day_id' })
  dayId: string;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder: number;

  // e.g. "08:30"
  @Column({ name: 'time_of_day', type: 'time', nullable: true })
  timeOfDay: string;

  @Column({ name: 'activity_title', type: 'varchar', length: 200 })
  activityTitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  // ── Relations ─────────────────────────────────────────────────

  @ManyToOne(() => ItineraryDay, (day) => day.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'day_id' })
  itineraryDay: ItineraryDay;
}