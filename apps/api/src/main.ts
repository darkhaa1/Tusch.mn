import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsService } from './modules/metrics/metrics.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust the first proxy so ThrottlerGuard uses the real client IP
  // from X-Forwarded-For when behind a reverse proxy (e.g. Nginx, Cloudflare).
  app.set('trust proxy', 1);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  app
    .getHttpAdapter()
    .get('/', (_req: any, res: any) =>
      res.status(302).set('Location', '/api/docs').end(),
    );
  app.use('/favicon.ico', (_req, res) => res.status(204).end());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new LoggingInterceptor(metricsService));

  const config = new DocumentBuilder()
    .setTitle('Tusch.mn API')
    .setDescription('API de la marketplace de services Tusch.mn')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('auth', 'Authentification et gestion de compte')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('listings', 'Annonces de services')
    .addTag('offers', 'Offres sur les annonces')
    .addTag('messages', 'Messagerie')
    .addTag('notifications', 'Notifications')
    .addTag('reviews', 'Avis et notes')
    .addTag('reports', 'Signalements')
    .addTag('admin', 'Administration')
    .addTag('health', 'Monitoring')
    .addTag('metrics', 'Metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3310);
  console.log(`Server running on http://localhost:3310`);
}
bootstrap();
