import { OnModuleInit } from "@nestjs/common";
import { ChatService } from "../chat/chat.service";
export declare class TelegramService implements OnModuleInit {
    private chatService;
    private bot;
    private isLaunched;
    constructor(chatService: ChatService);
    onModuleInit(): Promise<void>;
    private setupBot;
    sendMessage(chatId: string, message: string): Promise<void>;
}
