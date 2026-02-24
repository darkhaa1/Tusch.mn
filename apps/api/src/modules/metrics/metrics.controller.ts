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
    description: 'Application metrics (JSON)',
    schema: {
      example: {
        requestsTotal: 1500,
        requestsByStatus: { '200': 1200, '404': 50, '500': 10 },
        activeUsersCount: 120,
        listingsCount: 85,
        offersPendingCount: 40,
        uptimeSeconds: 86400,
        memoryUsage: { heapUsed: 52428800, heapTotal: 104857600 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getMetrics() {
    return this.metricsService.getMetrics();
  }
}
