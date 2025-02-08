import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Get configuration values
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT', 3000);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API for dynamic schema creation')
    .setVersion('1.0')
    .addTag('schema')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // Start the server
  await app.listen(PORT);
  Logger.log(`🚀 Server running at http://localhost:${PORT}`);
}

bootstrap();
