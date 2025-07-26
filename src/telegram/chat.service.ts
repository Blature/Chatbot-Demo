import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ProductsService } from '../products/products.service';
import * as dotenv from 'dotenv';
dotenv.config();

interface ChatMemory {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private memory: Record<string, ChatMemory[]> = {};

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
      model: 'gpt-3.5-turbo-1106',
      messages: [{ role: 'user', content: detectionPrompt }],
    });

    const answer = res.choices[0]?.message?.content?.toLowerCase().trim();
    return answer === 'yes';
  }

  private saveToMemory(
    userId: string,
    role: 'user' | 'assistant',
    content: string,
  ) {
    if (!this.memory[userId]) this.memory[userId] = [];
    this.memory[userId].push({ role, content });

    if (this.memory[userId].length > 10) {
      this.memory[userId] = this.memory[userId].slice(-10);
    }
  }

  async ask(
    question: string,
    language: string,
    userId = 'default',
  ): Promise<string> {
    const isListRequest = await this.isProductListQuestion(question);

    if (isListRequest) {
      const names = await this.productsService.findAllNames();
      const answer =
        names.length === 0
          ? 'No products have been registered in the store.'
          : `Store Product List:\n- ${names.join('\n- ')}`;

      this.saveToMemory(userId, 'user', question);
      this.saveToMemory(userId, 'assistant', answer);
      return answer;
    }

    const systemPrompt = `
You are an AI assistant working for a computer hardware store. 
You help customers find and learn about computer components (GPUs, CPUs, RAM, SSDs, etc). 
You have access to a product database from the store via a function called 'getProductInfo'.

Always try to answer with helpful, friendly and professional tone. 
If the user asks about a product not in the store, still explain it briefly using your own knowledge, and clearly mention it's not available.

Your goal is to act like a human assistant who is both technical and customer-friendly.
If the user asks for a list of products or brand suggestions, respond naturally, like a person would.
`.trim();

    const tools: OpenAI.Chat.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'getProductInfo',
          description:
            'Fetch product info from the database using product name or filters',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description:
                  'Name or partial name of the product user is asking about',
              },
              brand: {
                type: 'string',
                description: 'Brand of the product (optional)',
              },
              category: {
                type: 'string',
                description:
                  'Product category like GPU, CPU, RAM etc (optional)',
              },
            },
            required: ['name'],
          },
        },
      },
    ];

    const memoryMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...((this.memory[userId] ||
        []) as OpenAI.Chat.ChatCompletionMessageParam[]),
      { role: 'user', content: question },
    ];

    const initial = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: memoryMessages,
      tools,
      tool_choice: 'auto',
    });

    const assistantMessage = initial.choices[0].message;

    if (!assistantMessage.tool_calls) {
      const reply = assistantMessage.content?.trim() || 'No response from GPT.';
      this.saveToMemory(userId, 'user', question);
      this.saveToMemory(userId, 'assistant', reply);
      return reply;
    }

    const toolCalls = assistantMessage.tool_calls;
    const toolResponses: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    for (const toolCall of toolCalls) {
      const toolArgs = JSON.parse(toolCall.function.arguments);
      const products = await this.productsService.findByFilters({
        name: toolArgs.name,
        brand: toolArgs.brand,
        category: toolArgs.category,
      });

      const response = products.length
        ? products
            .map(
              (p) =>
                `Product: ${p.name}, Brand: ${p.brand}, Description: ${p.description}, Price: $${p.price}, Stock: ${p.stock}`,
            )
            .join('\n\n')
        : 'Product not found in database.';

      toolResponses.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: response,
      });
    }

    const second = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        ...memoryMessages,
        {
          role: 'assistant',
          content: null,
          tool_calls: assistantMessage.tool_calls,
        },
        ...toolResponses,
      ],
    });

    const finalAnswer =
      second.choices[0].message?.content?.trim() || 'No response.';
    this.saveToMemory(userId, 'user', question);
    this.saveToMemory(userId, 'assistant', finalAnswer);
    return finalAnswer;
  }
}
