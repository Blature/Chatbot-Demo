import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import * as stringSimilarity from 'string-similarity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }
  async findAllNames(): Promise<string[]> {
    const products = await this.productRepository.find({ select: ['name'] });
    return products.map((p) => p.name);
  }

  async findByName(name: string): Promise<Product | null> {
    const allProducts = await this.productRepository.find();
    const names = allProducts.map((p) => p.name);

    const match = stringSimilarity.findBestMatch(name.toLowerCase(), names);
    const best = match.bestMatch;

    if (best.rating > 0.5) {
      return allProducts.find((p) => p.name === best.target) || null;
    }

    return null;
  }

  create(product: Partial<Product>) {
    const newProduct = this.productRepository.create(product);
    return this.productRepository.save(newProduct);
  }
}
