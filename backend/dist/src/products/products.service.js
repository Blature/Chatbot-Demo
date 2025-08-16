"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_embedding_entity_1 = require("./entities/product-embedding.entity");
const openai_1 = require("openai");
let ProductsService = class ProductsService {
    constructor(productRepository, embeddingRepository, dataSource) {
        this.productRepository = productRepository;
        this.embeddingRepository = embeddingRepository;
        this.dataSource = dataSource;
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async createProduct(productData) {
        const product = this.productRepository.create(productData);
        return this.productRepository.save(product);
    }
    async generateEmbedding(text) {
        const response = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    }
    async createEmbedding(productId, embedding) {
        const productEmbedding = this.embeddingRepository.create({
            product_id: productId,
            embedding,
        });
        return this.embeddingRepository.save(productEmbedding);
    }
    async semanticSearch(query, k = 10) {
        const embedding = await this.generateEmbedding(query);
        const { rows } = await this.dataSource.query(`
      SELECT p.*, cosine_distance(pe.embedding, $1::float8[]) AS score
      FROM product_embeddings pe
      JOIN products p ON p.id = pe.product_id
      ORDER BY score ASC
      LIMIT $2
      `, [embedding, k]);
        return rows;
    }
    async getAllProducts() {
        return this.productRepository.find();
    }
    async clearAllData() {
        await this.dataSource.query('TRUNCATE TABLE "product_embeddings", "products" RESTART IDENTITY CASCADE');
    }
    async getProductByCode(productCode) {
        return this.productRepository.findOne({
            where: { product_code: productCode }
        });
    }
    async getProductByCodeInsensitive(productCode) {
        return this.productRepository
            .createQueryBuilder('product')
            .where('LOWER(product.product_code) = LOWER(:code)', { code: productCode })
            .getOne();
    }
    async getProductsByCategory(category) {
        return this.productRepository.find({
            where: { category }
        });
    }
    async getProductsByManufacturer(manufacturer) {
        return this.productRepository.find({
            where: { manufacturer }
        });
    }
    async getAvailableProducts() {
        return this.productRepository.find({
            where: { available: true }
        });
    }
    async getProductsByPriceRange(minPrice, maxPrice) {
        return this.productRepository
            .createQueryBuilder('product')
            .where('product.price >= :minPrice AND product.price <= :maxPrice', { minPrice, maxPrice })
            .getMany();
    }
    async getDistinctCategories() {
        const result = await this.productRepository
            .createQueryBuilder('product')
            .select('DISTINCT product.category', 'category')
            .where('product.category IS NOT NULL')
            .getRawMany();
        return result.map(r => r.category);
    }
    async getDistinctManufacturers() {
        const result = await this.productRepository
            .createQueryBuilder('product')
            .select('DISTINCT product.manufacturer', 'manufacturer')
            .where('product.manufacturer IS NOT NULL')
            .getRawMany();
        return result.map(r => r.manufacturer);
    }
    async getDistinctUnits() {
        const result = await this.productRepository
            .createQueryBuilder('product')
            .select('DISTINCT product.unit', 'unit')
            .where('product.unit IS NOT NULL')
            .getRawMany();
        return result.map(r => r.unit);
    }
    async searchProductsByName(searchTerm) {
        return this.productRepository
            .createQueryBuilder('product')
            .where('LOWER(product.product_name) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
            .getMany();
    }
    async searchProductsByDescription(searchTerm) {
        return this.productRepository
            .createQueryBuilder('product')
            .where('LOWER(product.description) LIKE LOWER(:searchTerm)', { searchTerm: `%${searchTerm}%` })
            .getMany();
    }
    async getProductsByCasNumber(casNumber) {
        return this.productRepository.find({
            where: { cas_number: casNumber }
        });
    }
    async getProductsByPurityRange(minPurity, maxPurity) {
        const allWithPurity = await this.productRepository
            .createQueryBuilder('product')
            .where('product.purity IS NOT NULL')
            .getMany();
        const toNumber = (purity) => {
            if (!purity)
                return null;
            const match = /([0-9]+(?:\.[0-9]+)?)/.exec(purity);
            return match ? parseFloat(match[1]) : null;
        };
        return allWithPurity.filter(p => {
            const val = toNumber(p.purity);
            return val !== null && val >= minPurity && val <= maxPurity;
        });
    }
    async getProductsByUnit(unit) {
        return this.productRepository.find({ where: { unit } });
    }
    async getProductStats() {
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_embedding_entity_1.ProductEmbedding)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map