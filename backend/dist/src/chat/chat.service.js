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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
const openai_1 = require("openai");
let ChatService = class ChatService {
    constructor(productsService) {
        this.productsService = productsService;
        this.conversationMemory = new Map();
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async processMessage(userId, message) {
        const history = this.getConversationHistory(userId);
        const productContext = await this.getProductContext(message);
        const systemPrompt = `شما یک مشاور فروش حرفه‌ای متخصص در محصولات شیمیایی هستید.
شما همیشه باید پاسخ‌های دوستانه، تخصصی و متقاعدکننده ارائه دهید.
هرگز نگویید که نمی‌دانید یا اطلاعاتی ندارید.

از اطلاعات محصولات موجود برای غنی‌سازی پاسخ‌هایتان استفاده کنید و به صورت کامل پاسخ دهید:

- اگر درباره قیمت پرسیدند: قیمت دقیق را از داده‌های محصول بگویید و در صورت امکان با سایر محصولات مقایسه کنید
- اگر درباره دسته‌بندی پرسیدند: محصولات آن دسته را نمونه بدهید و توضیح دهید
- اگر درباره سازنده/شرکت پرسیدند: اطلاعات کامل سازنده و محصولات آن شرکت را ارائه دهید
- اگر درباره توضیحات محصول پرسیدند: توضیحات کامل از دیتابیس را ارائه دهید و اطلاعات تکمیلی مفید اضافه کنید
- اگر درباره موجودی پرسیدند: وضعیت دقیق موجودی و زمان تحویل را مشخص کنید
- اگر درباره شرایط نگهداری پرسیدند: دستورالعمل‌های کامل نگهداری و ایمنی را ارائه دهید

اگر کاربر درخواست لیست محصولات کرد، حداکثر 10 محصول نمایش دهید.
همیشه سعی کنید اطلاعات تکمیلی مفید و نکات فنی مرتبط ارائه دهید.`;
        const userPrompt = `کاربر پرسید: "${message}"

محصولات مرتبط از کاتالوگ ما:
${productContext}

لطفاً به صورت دوستانه، تخصصی و فروش‌محور پاسخ کاملی ارائه دهید.`;
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userPrompt }
        ];
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: 500,
                temperature: 0.7,
            });
            const aiResponse = response.choices[0].message.content;
            this.updateConversationHistory(userId, message, aiResponse);
            return aiResponse;
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            return 'متأسفانه در حال حاضر مشکلی در سیستم وجود دارد. لطفاً دوباره تلاش کنید.';
        }
    }
    getConversationHistory(userId) {
        return this.conversationMemory.get(userId) || [];
    }
    async getProductContext(message) {
        const lowerMessage = message.toLowerCase();
        const listKeywords = [
            'محصولات', 'لیست', 'چندتا محصول', 'اسم محصول', 'چه محصولاتی', 'محصولاتتون', 'محصولات شما',
            'نام محصول', 'محصولات موجود', 'کاتالوگ', 'فهرست محصولات', 'چه چیزی دارید', 'چی دارید',
            'محصولاتی که دارید', 'اسم ببر', 'نام ببر', 'معرفی کن', 'نمایش بده', 'بگو چی دارید'
        ];
        const isListRequest = listKeywords.some(keyword => lowerMessage.includes(keyword));
        const priceKeywords = ['قیمت', 'چند', 'هزینه', 'تومان', 'پول', 'ارزان', 'گران', 'مقرون به صرفه'];
        const isPriceQuery = priceKeywords.some(keyword => lowerMessage.includes(keyword));
        const categoryKeywords = ['دسته', 'نوع', 'گروه', 'طبقه بندی', 'رده'];
        const isCategoryQuery = categoryKeywords.some(keyword => lowerMessage.includes(keyword));
        const manufacturerKeywords = ['سازنده', 'تولیدکننده', 'شرکت', 'برند', 'کمپانی'];
        const isManufacturerQuery = manufacturerKeywords.some(keyword => lowerMessage.includes(keyword));
        const availabilityKeywords = ['موجود', 'موجودی', 'داری', 'هست', 'نداری', 'تمام شده'];
        const isAvailabilityQuery = availabilityKeywords.some(keyword => lowerMessage.includes(keyword));
        const storageKeywords = ['نگهداری', 'انبارداری', 'شرایط', 'نحوه نگهداری'];
        const isStorageQuery = storageKeywords.some(keyword => lowerMessage.includes(keyword));
        const formatLine = (p) => {
            const parts = [];
            parts.push(`- ${p.product_name} (${p.unit}, Code: ${p.product_code})`);
            if (p.price !== undefined && p.price !== null)
                parts.push(`Price: ${p.price} Toman`);
            if (p.category)
                parts.push(`Category: ${p.category}`);
            if (p.manufacturer)
                parts.push(`Manufacturer: ${p.manufacturer}`);
            if (p.purity)
                parts.push(`Purity: ${p.purity}`);
            if (p.cas_number)
                parts.push(`CAS: ${p.cas_number}`);
            if (p.storage_conditions)
                parts.push(`Storage: ${p.storage_conditions}`);
            if (typeof p.available === 'boolean')
                parts.push(`Available: ${p.available ? 'Yes' : 'No'}`);
            if (p.description)
                parts.push(`Description: ${p.description}`);
            return parts.join(' | ');
        };
        let contextData = '';
        if (isListRequest) {
            const allProducts = await this.productsService.getAllProducts();
            if (allProducts && allProducts.length > 0) {
                const limitedProducts = allProducts.slice(0, 10);
                contextData = limitedProducts.map(formatLine).join('\n');
            }
            else {
                contextData = 'هیچ محصولی در کاتالوگ یافت نشد.';
            }
        }
        else if (isPriceQuery) {
            let foundProduct = null;
            const codeMatches = lowerMessage.match(/ch\d+/g);
            if (codeMatches) {
                for (const codeMatch of codeMatches) {
                    foundProduct = await this.productsService.getProductByCodeInsensitive(codeMatch);
                    if (foundProduct)
                        break;
                }
            }
            if (!foundProduct) {
                const searchResults = await this.productsService.semanticSearch(message, 8);
                if (searchResults && searchResults.length > 0) {
                    contextData = searchResults.map(formatLine).join('\n');
                    if (lowerMessage.includes('قیمت') && !searchResults.some(p => lowerMessage.includes(p.product_name.toLowerCase()))) {
                        const stats = await this.productsService.getProductStats();
                        contextData += `\n\nPrice Statistics:\nTotal Products: ${stats.totalProducts}\nAverage Price: ${stats.averagePrice.toFixed(0)} Toman`;
                    }
                }
                else {
                    contextData = 'محصولی برای استعلام قیمت یافت نشد.';
                }
            }
            else {
                contextData = formatLine(foundProduct);
            }
        }
        else if (isCategoryQuery) {
            const categories = await this.productsService.getDistinctCategories();
            const searchResults = await this.productsService.semanticSearch(message, 8);
            if (searchResults && searchResults.length > 0) {
                contextData = searchResults.map(formatLine).join('\n');
                contextData += `\n\nAvailable Categories: ${categories.join(', ')}`;
            }
            else {
                contextData = `Available Categories: ${categories.join(', ')}\n\nPlease specify which category you're interested in.`;
            }
        }
        else if (isManufacturerQuery) {
            const manufacturers = await this.productsService.getDistinctManufacturers();
            const searchResults = await this.productsService.semanticSearch(message, 8);
            if (searchResults && searchResults.length > 0) {
                contextData = searchResults.map(formatLine).join('\n');
                contextData += `\n\nAvailable Manufacturers: ${manufacturers.join(', ')}`;
            }
            else {
                contextData = `Available Manufacturers: ${manufacturers.join(', ')}\n\nPlease specify which manufacturer you're interested in.`;
            }
        }
        else if (isAvailabilityQuery) {
            const availableProducts = await this.productsService.getAvailableProducts();
            if (availableProducts && availableProducts.length > 0) {
                const limitedAvailable = availableProducts.slice(0, 10);
                contextData = limitedAvailable.map(formatLine).join('\n');
                contextData += `\n\nTotal Available Products: ${availableProducts.length}`;
            }
            else {
                contextData = 'متأسفانه هیچ محصولی در حال حاضر موجود نیست.';
            }
        }
        else if (isStorageQuery) {
            const searchResults = await this.productsService.semanticSearch(message, 8);
            if (searchResults && searchResults.length > 0) {
                contextData = searchResults.map(formatLine).join('\n');
            }
            else {
                contextData = 'محصولی برای بررسی شرایط نگهداری یافت نشد.';
            }
        }
        else {
            const searchResults = await this.productsService.semanticSearch(message, 5);
            if (searchResults && searchResults.length > 0) {
                contextData = searchResults.map(formatLine).join('\n');
            }
            else {
                contextData = 'محصولی در کاتالوگ یافت نشد.';
            }
        }
        return contextData;
    }
    updateConversationHistory(userId, userMessage, aiResponse) {
        const history = this.getConversationHistory(userId);
        history.push({ role: 'user', content: userMessage }, { role: 'assistant', content: aiResponse });
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }
        this.conversationMemory.set(userId, history);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ChatService);
//# sourceMappingURL=chat.service.js.map