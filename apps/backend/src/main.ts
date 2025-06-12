import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // 🔓 Active les requêtes cross-origin
  app.useGlobalPipes(new ValidationPipe()); // 🧹 Valide tous les DTO

  // ✅ Swagger config
  const config = new DocumentBuilder()
    .setTitle('Tusch API')
    .setDescription('API documentation for tusch.mn')
    .setVersion('1.0')
    .addBearerAuth() // 👈 Ajoute support du JWT dans Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3310);
  console.log(`🚀 Server running on http://localhost:3310`);
}
bootstrap();
