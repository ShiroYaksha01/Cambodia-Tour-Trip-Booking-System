/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Provider } from './provider.entity';

@Entity('provider_contacts')
export class ProviderContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'contact_type', type: 'varchar', length: 50 })
  contactType: string;

  @Column({ name: 'contact_value', type: 'varchar', length: 200 })
  contactValue: string;

  @ManyToOne(() => Provider, (provider) => provider.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
}

