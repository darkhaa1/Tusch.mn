import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsService } from './modules/metrics/metrics.service';

async function bootstrap() {
  let app: NestExpressApplication;
  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Config validation error')) {
      console.error(error.message);
    } else {
      console.error('Failed to start application:', error);
    }
    process.exit(1);
  }

  // Trust the first proxy so ThrottlerGuard uses the real client IP
  // from X-Forwarded-For when behind a reverse proxy (e.g. Nginx, Cloudflare).
  app.set('trust proxy', 1);

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });
  app.use(
    '/',
    (_req: Request, res: Response, next: NextFunction): void => {
      if (_req.path === '/') {
        res.redirect(302, '/api/docs');
      } else {
        next();
      }
    },
  );
  app.use('/favicon.ico', (_req: Request, res: Response) => res.status(204).end());
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new ThrottlerExceptionFilter(), new GlobalExceptionFilter());

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

  const port = process.env.PORT ?? 3310;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port} [${process.env.NODE_ENV}]`);
}
bootstrap();
