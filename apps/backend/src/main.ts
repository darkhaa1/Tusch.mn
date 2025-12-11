import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser()); // 🍪 Parse les cookies
  app.enableCors(
    {
      origin: process.env.CORS_ORIGIN, // 🌐 Autorise les requêtes depuis le frontend
      credentials: true, // ✅ Permet l'envoi de cookies
    }
  ); // 🔓 Active les requêtes cross-origin
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ✅ Swagger config
  const config = new DocumentBuilder()
    .setTitle('Tusch API')
    .setDescription('API documentation for tusch.mn')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3310);
  console.log(`🚀 Server running on http://localhost:3310`);
}
bootstrap();
