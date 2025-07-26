import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findByName(name: string): Promise<Product | null> {
    return await this.productRepo.findOne({
      where: { name: ILike(`%${name}%`) },
    });
  }

  async findAllNames(): Promise<string[]> {
    const products = await this.productRepo.find();
    return products.map((p) => p.name);
  }

  async findByFilters(filters: {
    name?: string;
    brand?: string;
    category?: string;
  }): Promise<Product[]> {
    const qb = this.productRepo.createQueryBuilder('product');

    if (filters.name) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.brand) {
      qb.andWhere('LOWER(product.brand) LIKE LOWER(:brand)', {
        brand: `%${filters.brand}%`,
      });
    }

    if (filters.category) {
      qb.andWhere('LOWER(product.category) = LOWER(:category)', {
        category: filters.category,
      });
    }

    return qb.getMany();
  }

  async filterProducts({
    name,
    brand,
    category,
  }: {
    name?: string;
    brand?: string;
    category?: string;
  }): Promise<Product[]> {
    const where: FindOptionsWhere<Product> = {};
    if (name) where.name = ILike(`%${name}%`);
    if (brand) where.brand = ILike(`%${brand}%`);
    if (category) where.category = ILike(`%${category}%`);

    return this.productRepo.find({ where });
  }
}
