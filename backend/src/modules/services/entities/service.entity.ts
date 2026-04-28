import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ServiceType } from '../../../shared/enums';

import type { Provider } from '../../provider/entities/provider.entity';
import type { ServiceImage } from './service-image.entity';
import type { ServiceInventory } from './service-inventory.entity';
import type { TourPackage } from './tour-package.entity';
import type { Accommodation } from './accommodation.entity';
import type { Transportation } from './transportation.entity';


@Entity('services')
export class Service {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'provider_id', type: 'uuid' })
  providerId: string;

  @Column({
    name: 'service_type',
    type: 'enum',
    enum: ServiceType
  })
  serviceType: ServiceType;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations

  @ManyToOne('Provider', 'services')
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @OneToMany('ServiceImage', 'service', { cascade: true })
  images: ServiceImage[];

  @OneToOne('ServiceInventory', 'service', { cascade: true })
  inventory: ServiceInventory;

  @OneToOne('TourPackage', 'service', { cascade: true })
  tourPackage: TourPackage;

  @OneToOne('Accommodation', 'service', { cascade: true })
  accommodation: Accommodation;

  @OneToOne('Transportation', 'service', { cascade: true })
  transportation: Transportation;
}