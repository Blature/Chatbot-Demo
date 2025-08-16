import { Repository, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductEmbedding } from './entities/product-embedding.entity';
export declare class ProductsService {
    private productRepository;
    private embeddingRepository;
    private dataSource;
    private openai;
    constructor(productRepository: Repository<Product>, embeddingRepository: Repository<ProductEmbedding>, dataSource: DataSource);
    createProduct(productData: Partial<Product>): Promise<Product>;
    generateEmbedding(text: string): Promise<number[]>;
    createEmbedding(productId: string, embedding: number[]): Promise<ProductEmbedding>;
    semanticSearch(query: string, k?: number): Promise<any[]>;
    getAllProducts(): Promise<Product[]>;
    clearAllData(): Promise<void>;
    getProductByCode(productCode: string): Promise<Product | null>;
    getProductByCodeInsensitive(productCode: string): Promise<Product | null>;
    getProductsByCategory(category: string): Promise<Product[]>;
    getProductsByManufacturer(manufacturer: string): Promise<Product[]>;
    getAvailableProducts(): Promise<Product[]>;
    getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
    getDistinctCategories(): Promise<string[]>;
    getDistinctManufacturers(): Promise<string[]>;
    getDistinctUnits(): Promise<string[]>;
    searchProductsByName(searchTerm: string): Promise<Product[]>;
    searchProductsByDescription(searchTerm: string): Promise<Product[]>;
    getProductsByCasNumber(casNumber: string): Promise<Product[]>;
    getProductsByPurityRange(minPurity: number, maxPurity: number): Promise<Product[]>;
    getProductsByUnit(unit: string): Promise<Product[]>;
    getProductStats(): Promise<{
        totalProducts: number;
        availableProducts: number;
        totalCategories: number;
        totalManufacturers: number;
        averagePrice: number;
    }>;
}
