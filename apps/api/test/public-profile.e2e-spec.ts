import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { prisma } from './utils/e2e-database';
import { createTestApp } from './utils/create-test-app';

describe('Public profile (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns public profile safely', async () => {
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

    const listing = await prisma.listing.create({
      data: {
        description: 'Test listing',
        price: 1000,
        location: 'UB',
        category: 'tutoring',
        userId: user.id,
      },
    });

    const offer = await prisma.offer.create({
      data: {
        listingId: listing.id,
        providerId: reviewer.id,
        price: 1000,
        message: 'Test offer',
        status: 'COMPLETED',
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      },
    });

    await prisma.review.create({
      data: {
        targetUserId: user.id,
        reviewerId: reviewer.id,
        offerId: offer.id,
        rating: 5,
        comment: 'Great service, very satisfied with the work done.',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/users/${user.id}/public`)
      .expect(200);

    const payload = res.body;
    expect(payload.user.id).toBe(user.id);
    expect(payload.stats.listingsCount).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(payload.recentListings)).toBe(true);
    expect(Array.isArray(payload.reviews)).toBe(true);

    const json = JSON.stringify(payload);
    expect(json).not.toMatch(/"email":/);
    expect(json).not.toMatch(/"phone":/);
  });

  it('returns 404 for missing user', async () => {
    await request(app.getHttpServer())
      .get('/users/non-existent/public')
      .expect(404);
  });
});
