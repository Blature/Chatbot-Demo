import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ProductsService } from '../products/products.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(private readonly productsService: ProductsService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async isProductListQuestion(question: string): Promise<boolean> {
    const detectionPrompt = `
You are a simple classifier. Answer with only "yes" or "no".
Does the following message ask for a list of all products?

Message: "${question}"
    `.trim();

    const res = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: detectionPrompt }],
    });

    const answer = res.choices[0]?.message?.content?.toLowerCase().trim();
    return answer === 'yes';
  }

  async ask(question: string, language: string): Promise<string> {
    const isListRequest = await this.isProductListQuestion(question);

    if (isListRequest) {
      const names = await this.productsService.findAllNames();
      if (names.length === 0)
        return 'No products have been registered in the store.';
      return `Store Product List:\n- ${names.join('\n- ')}`;
    }

    const systemPrompt = `
You are an AI assistant for a computer hardware store.
Only answer questions related to computer parts and our store's products.
If the question is unrelated, reply: "Sorry, I can only help with computer hardware-related questions."
Answer in the same language as the user question.
    `.trim();

    const tools: OpenAI.Chat.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'getProductInfo',
          description: 'Get product info from database',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Product name the user asked about',
              },
            },
            required: ['name'],
          },
        },
      },
    ];

    const initial = await this.openai.chat.completions.create({
      model: 'gpt-4-0613',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      tools,
      tool_choice: 'auto',
    });

    const assistantMessage = initial.choices[0].message;

    if (!assistantMessage.tool_calls) {
      return assistantMessage.content?.trim() || 'No response from GPT.';
    }

    const toolCall = assistantMessage.tool_calls[0];
    const toolArgs = JSON.parse(toolCall.function.arguments);
    const product = await this.productsService.findByName(toolArgs.name);

    const toolResponse = product
      ? `Product: ${product.name}, Brand: ${product.brand}, Description: ${product.description}, Price: ${product.price}, Stock: ${product.stock}`
      : 'Product not found in database.';

    const second = await this.openai.chat.completions.create({
      model: 'gpt-4-0613',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
        {
          role: 'assistant',
          content: null,
          tool_calls: assistantMessage.tool_calls,
        },
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResponse,
        },
      ],
    });

    return second.choices[0].message?.content?.trim() || 'No response.';
  }
}
