import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductEmbedding } from './entities/product-embedding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductEmbedding])],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}