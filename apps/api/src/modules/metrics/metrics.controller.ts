import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../common/guards/admin.guard';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@ApiTags('metrics')
@ApiBearerAuth('JWT-auth')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Get metrics (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics',
    schema: { example: '# HELP http_requests_total Total HTTP requests' },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
