import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { validateEnv } from './config/env.schema';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { CustomThrottlerGuard } from './common/throttler';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { HealthModule } from './modules/health/health.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ListingsModule } from './modules/listings/listings.module';
import { MessagesModule } from './modules/messages/messages.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OffersModule } from './modules/offers/offers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
      // In tests, process.env is fully populated by setup-e2e.ts. Skip
      // the local .env files so dev-only secrets (e.g. a real Resend
      // key) cannot leak into e2e runs and hit external services.
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      validate: validateEnv,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get('THROTTLE_TTL', 60_000),
            limit: config.get('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    HealthModule,
    MetricsModule,
    FirebaseModule,
    EmailModule,
    AuthModule,
    AuditModule,
    UserModule,
    ListingsModule,
    FavoritesModule,
    MessagesModule,
    AdminModule,
    ReviewsModule,
    NotificationsModule,
    OffersModule,
    ReportsModule,
  ],
  providers: [
    ...(process.env.NODE_ENV !== 'test'
      ? [{ provide: APP_GUARD, useClass: CustomThrottlerGuard }]
      : []),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
