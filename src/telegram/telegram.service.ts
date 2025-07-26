import { Injectable } from '@nestjs/common';
import { Ctx, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ChatService } from './chat.service';

@Update()
@Injectable()
export class TelegramService {
  constructor(private readonly chatService: ChatService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply('Hello! Ask a question about computer parts.');
  }

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (message && !('text' in message)) {
      console.log('Message is not Type of text');
      return;
    }
    if (message) {
      const text = message.text;
      const lang = message.from?.language_code || 'en';

      console.log('Text Message Recieved', text);

      const response = await this.chatService.ask(text, lang);
      await ctx.reply(response);
    }
  }
}
