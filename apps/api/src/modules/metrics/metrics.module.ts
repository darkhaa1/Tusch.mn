import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
