import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.provider)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'company_name', length: 150 })
  companyName: string;

  @Column({ type: 'text', nullable: true })
  logo: string;

  @Column({ name: 'cover_image', type: 'text', nullable: true })
  coverImage: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'service_category', type: 'varchar', length: 100, nullable: true })
  serviceCategory: string;

  @Column({ name: 'facebook_url', type: 'text', nullable: true })
  facebookUrl: string;

  @Column({ name: 'telegram_url', type: 'text', nullable: true })
  telegramUrl: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_name', length: 100, nullable: true })
  bankName: string;

  @Column({ name: 'refund_policy', type: 'text', nullable: true })
  refundPolicy: string;

  @Column({ name: 'guest_requirements', type: 'text', nullable: true })
  guestRequirements: string;

  @Column({ type: 'text', nullable: true })
  tagline: string;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string;

  @Column({ name: 'instagram_handle', type: 'varchar', length: 255, nullable: true })
  instagramHandle: string;

  @Column({ name: 'city_province', type: 'varchar', length: 255, nullable: true })
  cityProvince: string;

  @Column({ name: 'google_maps_link', type: 'text', nullable: true })
  googleMapsLink: string;

  @Column({ type: 'text', array: true, default: '{}' })
  highlights: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  languages: string[];

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 10.0,
  })
  commissionRate: number;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @OneToMany(() => Service, (service) => service.provider)
  services: Service[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}