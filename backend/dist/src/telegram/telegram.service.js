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
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const telegraf_1 = require("telegraf");
const chat_service_1 = require("../chat/chat.service");
let TelegramService = class TelegramService {
    constructor(chatService) {
        this.chatService = chatService;
        this.isLaunched = false;
        this.bot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN);
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
            }
            catch (error) {
                console.error('Failed to start Telegram bot:', error);
                this.isLaunched = false;
            }
        }, 3000);
    }
    setupBot() {
        this.bot.start((ctx) => {
            const welcomeMessage = `سلام! 👋

من دستیار فروش هوشمند محصولات شیمیایی هستم.
می‌توانید از من در مورد محصولات مختلف سوال کنید و من بهترین پیشنهادات را برایتان ارائه خواهم داد.

برای شروع، نام محصول مورد نظرتان را بنویسید یا سوال خود را مطرح کنید.`;
            ctx.reply(welcomeMessage);
        });
        this.bot.on("text", async (ctx) => {
            try {
                const userId = ctx.from.id.toString();
                const userMessage = ctx.message.text;
                if (userMessage.startsWith("/")) {
                    return;
                }
                await ctx.sendChatAction("typing");
                const response = await this.chatService.processMessage(userId, userMessage);
                await ctx.reply(response);
            }
            catch (error) {
                console.error("Telegram message processing error:", error);
                await ctx.reply("متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.");
            }
        });
        this.bot.catch((err, ctx) => {
            console.error("Telegram bot error:", err);
        });
    }
    async sendMessage(chatId, message) {
        try {
            await this.bot.telegram.sendMessage(chatId, message);
        }
        catch (error) {
            console.error("Failed to send message:", error);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map