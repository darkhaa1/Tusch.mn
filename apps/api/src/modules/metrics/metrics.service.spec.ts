import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../../test-utils/prisma-mock';

describe('MetricsService', () => {
  let service: MetricsService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    jest.clearAllMocks();
  });

  describe('incrementRequest', () => {
    it('should increment total and per-status counters', async () => {
      service.incrementRequest(200);
      service.incrementRequest(200);
      service.incrementRequest(404);

      prisma.$transaction.mockResolvedValue([10, 5, 2]);
      const metrics = await service.getMetrics();

      expect(metrics.requests_total).toBe(3);
      expect(metrics.requests_by_status['200']).toBe(2);
      expect(metrics.requests_by_status['404']).toBe(1);
    });
  });

  describe('getMetrics', () => {
    it('should return all metrics', async () => {
      prisma.$transaction.mockResolvedValue([100, 50, 3]);

      const metrics = await service.getMetrics();

      expect(metrics.uptime_seconds).toBeGreaterThanOrEqual(0);
      expect(metrics.active_users_count).toBe(100);
      expect(metrics.listings_count).toBe(50);
      expect(metrics.offers_pending_count).toBe(3);
      expect(metrics.memory).toBeDefined();
      expect(metrics.memory.heap_used_mb).toBeGreaterThan(0);
      expect(metrics.timestamp).toBeDefined();
    });
  });
});
