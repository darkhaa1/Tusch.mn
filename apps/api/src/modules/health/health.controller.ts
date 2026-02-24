import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
    schema: { example: { status: 'ok' } },
  })
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({
    status: 200,
    description: 'Service readiness',
    schema: {
      example: {
        status: 'ok',
        info: { database: { status: 'up' } },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  readiness() {
    return this.health.check([
      // Database check
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch {
          return { database: { status: 'down' } };
        }
      },
      // Memory check: heap should be under ~512MB
      () => this.memory.checkHeap('memory', 512 * 1024 * 1024),
    ]);
  }
}
