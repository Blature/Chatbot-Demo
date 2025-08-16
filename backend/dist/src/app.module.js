"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const products_module_1 = require("./products/products.module");
const chat_module_1 = require("./chat/chat.module");
const telegram_module_1 = require("./telegram/telegram.module");
const product_entity_1 = require("./products/entities/product.entity");
const product_embedding_entity_1 = require("./products/entities/product-embedding.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['../.env', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [product_entity_1.Product, product_embedding_entity_1.ProductEmbedding],
                synchronize: true,
                logging: true,
                extra: {
                    connectionTimeoutMillis: 10000,
                    idleTimeoutMillis: 10000,
                },
            }),
            products_module_1.ProductsModule,
            chat_module_1.ChatModule,
            telegram_module_1.TelegramModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map