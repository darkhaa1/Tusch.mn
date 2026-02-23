import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../common/guards/admin.guard';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@ApiTags('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get()
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
