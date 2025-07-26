import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get('search')
  findByName(@Query('name') name: string): Promise<Product | null> {
    return this.productsService.findByName(name);
  }

  @Post()
  create(@Body() body: Partial<Product>) {
    return this.productsService.create(body);
  }
}
