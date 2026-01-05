import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('Public profile (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    const reviewer = await prisma.user.create({
      data: {
        email: `reviewer-${Date.now()}@example.com`,
        password: 'password',
        firstName: 'Reviewer',
        lastName: 'Test',
        phone: '00000000',
        accountType: 'basic',
      },
    });

    const user = await prisma.user.create({
      data: {
        email: `profile-${Date.now()}@example.com`,
        password: 'password',
        firstName: 'Public',
        lastName: 'User',
        phone: '11111111',
        accountType: 'basic',
        avatarUrl: '/uploads/test-avatar.jpg',
      },
    });
    userId = user.id;

    await prisma.listing.create({
      data: {
        description: 'Test listing',
        price: 1000,
        location: 'UB',
        category: 'test',
        userId: user.id,
      },
    });

    await prisma.review.create({
      data: {
        targetUserId: user.id,
        reviewerId: reviewer.id,
        rating: 5,
        comment: 'Сайн хэрэглэгч',
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.review.deleteMany({ where: { targetUserId: userId } });
      await prisma.listing.deleteMany({ where: { userId } });
      await prisma.user.deleteMany({
        where: { OR: [{ id: userId }, { email: { startsWith: 'reviewer-' } }] },
      });
    }
    await app.close();
  });

  it('returns public profile safely', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${userId}/public`)
      .expect(200);

    const payload = res.body;
    expect(payload.user.id).toBe(userId);
    expect(payload.stats.listingsCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(payload.recentListings)).toBe(true);
    expect(Array.isArray(payload.reviews)).toBe(true);

    const json = JSON.stringify(payload);
    expect(json).not.toMatch(/"email":/);
    expect(json).not.toMatch(/"phone":/);
  });

  it('returns 404 for missing user', async () => {
    await request(app.getHttpServer()).get('/users/non-existent/public').expect(404);
  });
});
