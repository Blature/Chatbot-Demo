import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private conversationMemory: Map<string, any[]> = new Map();

  constructor(private productsService: ProductsService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processMessage(userId: string, message: string): Promise<string> {
    const history = this.getConversationHistory(userId);
    
    const productContext = await this.getProductContext(message);

    const systemPrompt = `شما یک مشاور فروش حرفه‌ای متخصص در محصولات شیمیایی و آزمایشگاهی این کاتالوگ هستید.
- فقط به پرسش‌های مرتبط با فروش و مشاوره محصولات شیمیایی پاسخ بده: نام و کد محصول، قیمت، موجودی، واحد و بسته‌بندی، دسته‌بندی، سازنده/برند، خلوص، توضیحات، شماره CAS، شرایط نگهداری و نکات ایمنی عمومی، مقایسه محصولات، شرایط سفارش و ارسال.
- اگر کاربر درباره موضوعات نامرتبط (مثل قطعات کامپیوتر، سخت‌افزار/نرم‌افزار، برنامه‌نویسی، الکترونیک، خودرو، پزشکی، حقوقی و ...) پرسید، مودبانه اما قاطعانه پاسخ را رد کن و مکالمه را به سمت نیازهای شیمیایی هدایت کن. مثال: «در حوزه قطعات کامپیوتر پاسخگو نیستم؛ اگر نام یا کد محصول شیمیایی مدنظرتان را بفرمایید با کمال میل راهنمایی می‌کنم.»

راهبرد پاسخ:
- لحن دوستانه، حرفه‌ای و فروش‌محور را حفظ کن؛ مختصر اما کامل باش.
- از اطلاعات موجود کاتالوگ برای غنی‌سازی پاسخ استفاده کن؛ اگر داده دقیق موجود نیست، حدس نزن و شفاف اطلاع بده و پیشنهاد بررسی/استعلام و یا ارائه گزینه‌های مشابه بده.
- در صورت ابهام، 1 تا 2 سؤال روشن‌کننده بپرس تا نیاز کاربر را به یکی از محصولات کاتالوگ وصل کنی.

راهنمای ارائه پاسخ بر اساس نوع سوال:
- اگر درباره قیمت پرسیدند: قیمت دقیق موجود را بگو و در صورت نیاز با گزینه‌های نزدیک مقایسه کن.
- اگر درباره دسته‌بندی پرسیدند: چند نمونه از آن دسته را معرفی کن و تفاوت‌ها را توضیح بده.
- اگر درباره سازنده/شرکت پرسیدند: محصولات مرتبط آن برند را معرفی کن و نقاط قوت را بگو.
- اگر درباره توضیحات محصول پرسیدند: توضیحات کامل از دیتابیس را ارائه بده و نکات فنی مفید اضافه کن.
- اگر درباره موجودی پرسیدند: وضعیت موجودی و زمان تقریبی تامین/تحویل را مشخص کن (در صورت عدم قطعیت، پیشنهاد پیگیری بده).
- اگر درباره شرایط نگهداری پرسیدند: دستورالعمل‌های نگهداری و ایمنی عمومی را ارائه بده (از ارائه راهنمایی خطرناک یا خارج از حیطه تخصصی پرهیز کن).

اگر کاربر درخواست لیست محصولات کرد، حداکثر 10 مورد نمایش بده و پیشنهاد ادامه گفتگو برای جزئیات بیشتر بده.`;

    const userPrompt = `کاربر پرسید: "${message}"

محصولات مرتبط از کاتالوگ ما:
${productContext}

لطفاً به صورت دوستانه، تخصصی و فروش‌محور پاسخ کاملی ارائه دهید.`;

    const messages: any[] = [
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
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'متأسفانه در حال حاضر مشکلی در سیستم وجود دارد. لطفاً دوباره تلاش کنید.';
    }
  }

  private getConversationHistory(userId: string): any[] {
    return this.conversationMemory.get(userId) || [];
  }

  private async getProductContext(message: string): Promise<string> {
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

    const formatLine = (p: any) => {
      const parts: string[] = [];
      parts.push(`- ${p.product_name} (${p.unit}, Code: ${p.product_code})`);
      if (p.price !== undefined && p.price !== null) parts.push(`Price: ${p.price} Toman`);
      if (p.category) parts.push(`Category: ${p.category}`);
      if (p.manufacturer) parts.push(`Manufacturer: ${p.manufacturer}`);
      if (p.purity) parts.push(`Purity: ${p.purity}`);
      if (p.cas_number) parts.push(`CAS: ${p.cas_number}`);
      if (p.storage_conditions) parts.push(`Storage: ${p.storage_conditions}`);
      if (typeof p.available === 'boolean') parts.push(`Available: ${p.available ? 'Yes' : 'No'}`);
      if (p.description) parts.push(`Description: ${p.description}`);
      return parts.join(' | ');
    };

    let contextData = '';

    if (isListRequest) {
      const allProducts = await this.productsService.getAllProducts();
      if (allProducts && allProducts.length > 0) {
        const limitedProducts = allProducts.slice(0, 10);
        contextData = limitedProducts.map(formatLine).join('\n');
      } else {
        contextData = 'هیچ محصولی در کاتالوگ یافت نشد.';
      }
    } else if (isPriceQuery) {
      let foundProduct = null;
      const codeMatches = lowerMessage.match(/ch\d+/g);
      if (codeMatches) {
        for (const codeMatch of codeMatches) {
          foundProduct = await this.productsService.getProductByCodeInsensitive(codeMatch);
          if (foundProduct) break;
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
        } else {
          contextData = 'محصولی برای استعلام قیمت یافت نشد.';
        }
      } else {
        contextData = formatLine(foundProduct);
      }
    } else if (isCategoryQuery) {
      const categories = await this.productsService.getDistinctCategories();
      const searchResults = await this.productsService.semanticSearch(message, 8);
      
      if (searchResults && searchResults.length > 0) {
        contextData = searchResults.map(formatLine).join('\n');
        contextData += `\n\nAvailable Categories: ${categories.join(', ')}`;
      } else {
        contextData = `Available Categories: ${categories.join(', ')}\n\nPlease specify which category you're interested in.`;
      }
    } else if (isManufacturerQuery) {
      const manufacturers = await this.productsService.getDistinctManufacturers();
      const searchResults = await this.productsService.semanticSearch(message, 8);
      
      if (searchResults && searchResults.length > 0) {
        contextData = searchResults.map(formatLine).join('\n');
        contextData += `\n\nAvailable Manufacturers: ${manufacturers.join(', ')}`;
      } else {
        contextData = `Available Manufacturers: ${manufacturers.join(', ')}\n\nPlease specify which manufacturer you're interested in.`;
      }
    } else if (isAvailabilityQuery) {
      const availableProducts = await this.productsService.getAvailableProducts();
      if (availableProducts && availableProducts.length > 0) {
        const limitedAvailable = availableProducts.slice(0, 10);
        contextData = limitedAvailable.map(formatLine).join('\n');
        contextData += `\n\nTotal Available Products: ${availableProducts.length}`;
      } else {
        contextData = 'متأسفانه هیچ محصولی در حال حاضر موجود نیست.';
      }
    } else if (isStorageQuery) {
      const searchResults = await this.productsService.semanticSearch(message, 8);
      if (searchResults && searchResults.length > 0) {
        contextData = searchResults.map(formatLine).join('\n');
      } else {
        contextData = 'محصولی برای بررسی شرایط نگهداری یافت نشد.';
      }
    } else {
      const searchResults = await this.productsService.semanticSearch(message, 5);
      if (searchResults && searchResults.length > 0) {
        contextData = searchResults.map(formatLine).join('\n');
      } else {
        contextData = 'محصولی در کاتالوگ یافت نشد.';
      }
    }

    return contextData;
  }

  private updateConversationHistory(userId: string, userMessage: string, aiResponse: string): void {
    const history = this.getConversationHistory(userId);
    
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    );
    
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    this.conversationMemory.set(userId, history);
  }
}