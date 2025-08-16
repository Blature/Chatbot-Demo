import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { ChatModule } from './chat/chat.module';
import { TelegramModule } from './telegram/telegram.module';
import { Product } from './products/entities/product.entity';
import { ProductEmbedding } from './products/entities/product-embedding.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Product, ProductEmbedding],
      synchronize: true,
      logging: true,
      extra: {
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 10000,
      },
    }),
    ProductsModule,
    ChatModule,
    TelegramModule,
  ],
})
export class AppModule {}