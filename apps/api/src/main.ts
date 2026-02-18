import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust the first proxy so ThrottlerGuard uses the real client IP
  // from X-Forwarded-For when behind a reverse proxy (e.g. Nginx, Cloudflare).
  app.set('trust proxy', 1);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  app.enableCors({
    origin: process.env.CORS_ORIGIN, // 🌐 Autorise les requêtes depuis le frontend
    credentials: true, // ✅ Permet l'envoi de cookies
  }); // 🔓 Active les requêtes cross-origin
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
