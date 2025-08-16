import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  product_code: string;

  @Column({ type: 'text' })
  product_name: string;

  @Column({ type: 'text' })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  manufacturer: string;

  @Column({ type: 'text', nullable: true })
  purity: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  storage_conditions: string;

  @Column({ type: 'text', nullable: true })
  cas_number: string;

  @Column({ type: 'boolean', default: true })
  available: boolean;
}