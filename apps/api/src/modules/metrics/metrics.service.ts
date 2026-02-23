import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MetricsService {
  private requestsTotal = 0;
  private readonly requestsByStatus: Record<string, number> = {};

  constructor(private prisma: PrismaService) {}

  incrementRequest(statusCode: number) {
    this.requestsTotal++;
    const key = `${statusCode}`;
    this.requestsByStatus[key] = (this.requestsByStatus[key] ?? 0) + 1;
  }

  async getMetrics() {
    const [activeUsersCount, listingsCount, offersPendingCount] =
      await this.prisma.$transaction([
        this.prisma.user.count({
          where: { deletedAt: null, status: 'ACTIVE' },
        }),
        this.prisma.listing.count({
          where: { deletedAt: null, status: 'ACTIVE' },
        }),
        (this.prisma as any).offer.count({
          where: { status: 'PENDING' },
        }),
      ]);

    return {
      uptime_seconds: Math.floor(process.uptime()),
      requests_total: this.requestsTotal,
      requests_by_status: { ...this.requestsByStatus },
      active_users_count: activeUsersCount,
      listings_count: listingsCount,
      offers_pending_count: offersPendingCount,
      memory: {
        heap_used_mb: Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024,
        ),
        heap_total_mb: Math.round(
          process.memoryUsage().heapTotal / 1024 / 1024,
        ),
        rss_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
