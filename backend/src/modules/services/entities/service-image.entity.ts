import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_images')
export class ServiceImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  // true = shown as the thumbnail on the service card
  @Column({ name: 'is_cover', type: 'boolean', default: false })
  isCover: boolean;

  @Column({ name: 'sort_order', type: 'smallint', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamptz' })
  uploadedAt: Date;

  // ── Relations ─────────────────────────────────────────────────

  @ManyToOne(() => Service, (service) => service.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}