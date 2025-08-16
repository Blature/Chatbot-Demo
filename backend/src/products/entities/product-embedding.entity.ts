import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_embeddings')
export class ProductEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @Column({ type: 'float8', array: true })
  embedding: number[];

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}