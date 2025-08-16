import { Product } from './product.entity';
export declare class ProductEmbedding {
    id: string;
    product_id: string;
    embedding: number[];
    product: Product;
}
