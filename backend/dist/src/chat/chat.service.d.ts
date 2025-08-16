import { ProductsService } from '../products/products.service';
export declare class ChatService {
    private productsService;
    private openai;
    private conversationMemory;
    constructor(productsService: ProductsService);
    processMessage(userId: string, message: string): Promise<string>;
    private getConversationHistory;
    private getProductContext;
    private updateConversationHistory;
}
