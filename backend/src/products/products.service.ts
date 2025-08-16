import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductEmbedding } from './entities/product-embedding.entity';
import OpenAI from 'openai';

@Injectable()
export class ProductsService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductEmbedding)
    private embeddingRepository: Repository<ProductEmbedding>,
    private dataSource: DataSource,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  async createEmbedding(productId: string, embedding: number[]): Promise<ProductEmbedding> {
    const productEmbedding = this.embeddingRepository.create({
      product_id: productId,
      embedding,
    });
    return this.embeddingRepository.save(productEmbedding);
  }

  async semanticSearch(query: string, k = 10): Promise<any[]> {
    const embedding = await this.generateEmbedding(query);

    const { rows } = await this.dataSource.query(
      `
      SELECT p.*, cosine_distance(pe.embedding, $1::float8[]) AS score
      FROM product_embeddings pe
      JOIN products p ON p.id = pe.product_id
      ORDER BY score ASC
      LIMIT $2
      `,
      [embedding, k]
    );

    return rows;
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async clearAllData(): Promise<void> {
    await this.dataSource.query('TRUNCATE TABLE "product_embeddings", "products" RESTART IDENTITY CASCADE');
  }


  async getProductByCode(productCode: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { product_code: productCode }
    });
  }

  async getProductByCodeInsensitive(productCode: string): Promise<Product | null> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.product_code) = LOWER(:code)', { code: productCode })
      .getOne();
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { category }
    });
  }

  async getProductsByManufacturer(manufacturer: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { manufacturer }
    });
  }

  async getAvailableProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { available: true }
    });
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('product.price >= :minPrice AND product.price <= :maxPrice', { minPrice, maxPrice })
      .getMany();
  }

  async getDistinctCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .getRawMany();
    return result.map(r => r.category);
  }

  async getDistinctManufacturers(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.manufacturer', 'manufacturer')
      .where('product.manufacturer IS NOT NULL')
      .getRawMany();
    return result.map(r => r.manufacturer);
  }

  async getDistinctUnits(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.unit', 'unit')
      .where('product.unit IS NOT NULL')
      .getRawMany();
    return result.map(r => r.unit);
  }

  async searchProductsByName(searchTerm: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.product_name) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  async searchProductsByDescription(searchTerm: string): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .where('LOWER(product.description) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
      .getMany();
  }

  async getProductsByCasNumber(casNumber: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { cas_number: casNumber }
    });
  }

  async getProductsByPurityRange(minPurity: number, maxPurity: number): Promise<Product[]> {
    const allWithPurity = await this.productRepository
      .createQueryBuilder('product')
      .where('product.purity IS NOT NULL')
      .getMany();

    const toNumber = (purity: string | null | undefined): number | null => {
      if (!purity) return null;
      const match = /([0-9]+(?:\.[0-9]+)?)/.exec(purity);
      return match ? parseFloat(match[1]) : null;
    };

    return allWithPurity.filter(p => {
      const val = toNumber(p.purity);
      return val !== null && val >= minPurity && val <= maxPurity;
    });
  }

  async getProductsByUnit(unit: string): Promise<Product[]> {
    return this.productRepository.find({ where: { unit } });
  }

  async getProductStats(): Promise<{
    totalProducts: number;
    availableProducts: number;
    totalCategories: number;
    totalManufacturers: number;
    averagePrice: number;
  }> {
    const totalProducts = await this.productRepository.count();
    const availableProducts = await this.productRepository.count({ where: { available: true } });
    const categories = await this.getDistinctCategories();
    const manufacturers = await this.getDistinctManufacturers();
    
    const avgPriceResult = await this.productRepository
      .createQueryBuilder('product')
      .select('AVG(product.price)', 'average')
      .where('product.price IS NOT NULL')
      .getRawOne();

    return {
      totalProducts,
      availableProducts,
      totalCategories: categories.length,
      totalManufacturers: manufacturers.length,
      averagePrice: avgPriceResult?.average || 0
    };
  }
}