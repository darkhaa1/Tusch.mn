import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { prisma } from './utils/e2e-database';
import { createTestApp } from './utils/create-test-app';

describe('Reports (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const register = (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    accountType: string;
  }) => request(app.getHttpServer()).post('/auth/register').send({ acceptedTerms: true, ...payload });

  const markEmailVerified = async (email: string) => {
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
    });
  };

  const registerAndVerify = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    accountType: string;
  }) => {
    const res = await register(payload).expect(201);
    await markEmailVerified(payload.email);
    return res;
  };

  const login = async (email: string, password: string) => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const cookieHeader = res.headers['set-cookie']?.[0];
    if (!cookieHeader) {
      throw new Error('Missing auth cookie');
    }
    return cookieHeader.split(';')[0];
  };

  const authedGet = (path: string, cookie: string) =>
    request(app.getHttpServer()).get(path).set('Cookie', cookie);

  const authedPost = (
    path: string,
    cookie: string,
    body: Record<string, unknown> | string,
  ) => request(app.getHttpServer()).post(path).set('Cookie', cookie).send(body);

  const authedPatch = (
    path: string,
    cookie: string,
    body: Record<string, unknown> | string,
  ) =>
    request(app.getHttpServer()).patch(path).set('Cookie', cookie).send(body);

  const setup = async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const password = 'password123';
    const ownerEmail = `report-owner-${suffix}@example.com`;
    const reporterEmail = `report-reporter-${suffix}@example.com`;
    const adminEmail = `report-admin-${suffix}@example.com`;

    const ownerRes = await registerAndVerify({
      email: ownerEmail,
      password,
      firstName: 'Owner',
      lastName: 'User',
      phone: '11111111',
      accountType: 'basic',
    });
    const reporterRes = await registerAndVerify({
      email: reporterEmail,
      password,
      firstName: 'Reporter',
      lastName: 'User',
      phone: '22222222',
      accountType: 'basic',
    });
    const adminRes = await registerAndVerify({
      email: adminEmail,
      password,
      firstName: 'Admin',
      lastName: 'User',
      phone: '33333333',
      accountType: 'basic',
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { isAdmin: true, adminRole: 'ADMIN' },
    });

    const ownerCookie = await login(ownerEmail, password);
    const reporterCookie = await login(reporterEmail, password);
    const adminCookie = await login(adminEmail, password);

    const listingRes = await authedPost('/listings', ownerCookie, {
      description: 'Listing to report',
      price: 1200,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    return {
      ownerId: ownerRes.body.id as string,
      reporterId: reporterRes.body.id as string,
      adminId: adminRes.body.id as string,
      listingId: listingRes.body.id as string,
      ownerCookie,
      reporterCookie,
      adminCookie,
    };
  };

  it('creates a report', async () => {
    const ctx = await setup();

    const res = await authedPost('/reports', ctx.reporterCookie, {
      targetType: 'LISTING',
      targetId: ctx.listingId,
      reason: 'SPAM',
      description: 'Suspicious content',
    }).expect(201);

    expect(res.body.targetType).toBe('LISTING');
    expect(res.body.targetId).toBe(ctx.listingId);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.reporterId).toBe(ctx.reporterId);
  });

  it('prevents duplicate active reports for same reporter and target', async () => {
    const ctx = await setup();

    await authedPost('/reports', ctx.reporterCookie, {
      targetType: 'LISTING',
      targetId: ctx.listingId,
      reason: 'SPAM',
    }).expect(201);

    await authedPost('/reports', ctx.reporterCookie, {
      targetType: 'LISTING',
      targetId: ctx.listingId,
      reason: 'FRAUD',
    }).expect(409);
  });

  it('lists reports in admin endpoint with reporter and target info', async () => {
    const ctx = await setup();

    await authedPost('/reports', ctx.reporterCookie, {
      targetType: 'LISTING',
      targetId: ctx.listingId,
      reason: 'INAPPROPRIATE',
    }).expect(201);

    await authedPost('/reports', ctx.ownerCookie, {
      targetType: 'USER',
      targetId: ctx.reporterId,
      reason: 'OTHER',
      description: 'Abusive behavior',
    }).expect(201);

    const listRes = await authedGet(
      '/admin/reports?status=PENDING&targetType=LISTING',
      ctx.adminCookie,
    ).expect(200);

    expect(Array.isArray(listRes.body.items)).toBe(true);
    expect(listRes.body.total).toBe(1);
    expect(listRes.body.items[0].reporter).toBeTruthy();
    expect(listRes.body.items[0].target).toBeTruthy();
    expect(listRes.body.items[0].targetType).toBe('LISTING');
  });

  it('allows admin to review and dismiss reports', async () => {
    const ctx = await setup();

    const reviewedReport = await authedPost('/reports', ctx.reporterCookie, {
      targetType: 'LISTING',
      targetId: ctx.listingId,
      reason: 'SPAM',
    }).expect(201);

    const dismissedReport = await authedPost('/reports', ctx.ownerCookie, {
      targetType: 'USER',
      targetId: ctx.reporterId,
      reason: 'OTHER',
    }).expect(201);

    const reviewedRes = await authedPatch(
      `/admin/reports/${reviewedReport.body.id}`,
      ctx.adminCookie,
      { status: 'REVIEWED' },
    ).expect(200);

    expect(reviewedRes.body.status).toBe('REVIEWED');
    expect(reviewedRes.body.reviewedAt).toBeTruthy();
    expect(reviewedRes.body.reviewedBy).toBe(ctx.adminId);

    const dismissedRes = await authedPatch(
      `/admin/reports/${dismissedReport.body.id}`,
      ctx.adminCookie,
      { status: 'DISMISSED' },
    ).expect(200);

    expect(dismissedRes.body.status).toBe('DISMISSED');
    expect(dismissedRes.body.reviewedAt).toBeTruthy();
    expect(dismissedRes.body.reviewedBy).toBe(ctx.adminId);
  });
});
