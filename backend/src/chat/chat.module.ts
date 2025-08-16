import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}