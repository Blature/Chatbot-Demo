import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  try {
    console.log('Creating NestJS application...');
    const app = await NestFactory.create(AppModule);
    console.log('NestJS application created successfully');
    
    const configService = app.get(ConfigService);
    console.log('ConfigService obtained');
    
    const port = configService.get('PORT') || 3000;
    console.log(`Starting server on port ${port}...`);
    
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch(error => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});