import { Injectable, OnModuleInit } from "@nestjs/common";
import { Telegraf, Context } from "telegraf";
import { ChatService } from "../chat/chat.service";

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private isLaunched = false;

  constructor(private chatService: ChatService) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.setupBot();
  }

  async onModuleInit() {
    setTimeout(async () => {
      try {
        if (!this.isLaunched) {
          await this.bot.telegram.deleteWebhook();
          console.log('Deleted existing webhook');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await this.bot.launch();
          this.isLaunched = true;
          console.log('Telegram bot started successfully');
        }
      } catch (error) {
        console.error('Failed to start Telegram bot:', error);
        this.isLaunched = false;
      }
    }, 3000);
  }

  private setupBot() {
    // Start command
    this.bot.start((ctx) => {
      const welcomeMessage = `سلام! 👋

من دستیار فروش هوشمند محصولات شیمیایی هستم.
می‌توانید از من در مورد محصولات مختلف سوال کنید و من بهترین پیشنهادات را برایتان ارائه خواهم داد.

برای شروع، نام محصول مورد نظرتان را بنویسید یا سوال خود را مطرح کنید.`;

      ctx.reply(welcomeMessage);
    });

    // Handle all text messages
    this.bot.on("text", async (ctx) => {
      try {
        const userId = ctx.from.id.toString();
        const userMessage = ctx.message.text;

        // Skip if it's a command
        if (userMessage.startsWith("/")) {
          return;
        }

        // Show typing indicator
        await ctx.sendChatAction("typing");

        // Process message through chat service
        const response = await this.chatService.processMessage(
          userId,
          userMessage
        );

        // Send response
        await ctx.reply(response);
      } catch (error) {
        console.error("Telegram message processing error:", error);
        await ctx.reply("متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.");
      }
    });

    // Error handling
    this.bot.catch((err, ctx) => {
      console.error("Telegram bot error:", err);
    });
  }

  async sendMessage(chatId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }
}
