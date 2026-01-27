import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from './utils/e2e-database';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
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
  }) => request(app.getHttpServer()).post('/auth/register').send(payload);

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

  it('registers, logs in, and returns the current user', async () => {
    const email = `user-${Date.now()}@example.com`;
    const password = 'password123';

    await register({
      email,
      password,
      firstName: 'Test',
      lastName: 'User',
      phone: '12345678',
      accountType: 'basic',
    }).expect(201);

    const cookie = await login(email, password);

    const res = await authedGet('/auth/me', cookie).expect(200);
    expect(res.body.user.email).toBe(email);
  });

  it('enforces admin guard on stats', async () => {
    const email = `member-${Date.now()}@example.com`;
    const password = 'password123';

    await register({
      email,
      password,
      firstName: 'Member',
      lastName: 'User',
      phone: '87654321',
      accountType: 'basic',
    }).expect(201);

    const cookie = await login(email, password);

    await authedGet('/admin/stats', cookie).expect(403);

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    await authedGet('/admin/stats', cookie).expect(200);
  });

  it('hides listings from the public feed when marked hidden', async () => {
    const email = `admin-${Date.now()}@example.com`;
    const password = 'password123';

    await register({
      email,
      password,
      firstName: 'Admin',
      lastName: 'User',
      phone: '11122233',
      accountType: 'basic',
    }).expect(201);

    await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    });

    const cookie = await login(email, password);

    const createRes = await authedPost('/listings', cookie, {
      description: 'Listing created for e2e testing.',
      price: 1200,
      location: 'UB',
      category: 'services',
    }).expect(201);

    const listingId = createRes.body.id as string;

    const listRes = await request(app.getHttpServer())
      .get('/listings')
      .expect(200);
    expect(
      listRes.body.items.some((item: { id: string }) => item.id === listingId),
    ).toBe(true);

    await authedPatch(`/admin/listings/${listingId}/status`, cookie, {
      status: 'HIDDEN',
    }).expect(200);

    const listAfter = await request(app.getHttpServer())
      .get('/listings')
      .expect(200);
    expect(
      listAfter.body.items.some(
        (item: { id: string }) => item.id === listingId,
      ),
    ).toBe(false);

    await request(app.getHttpServer())
      .get(`/listings/${listingId}`)
      .expect(404);
  });

  it('handles messages flow from send to threads and conversation', async () => {
    const userAEmail = `usera-${Date.now()}@example.com`;
    const userBEmail = `userb-${Date.now()}@example.com`;
    const password = 'password123';

    const userARes = await register({
      email: userAEmail,
      password,
      firstName: 'User',
      lastName: 'A',
      phone: '10000000',
      accountType: 'basic',
    }).expect(201);

    const userBRes = await register({
      email: userBEmail,
      password,
      firstName: 'User',
      lastName: 'B',
      phone: '20000000',
      accountType: 'basic',
    }).expect(201);

    const userAId = userARes.body.id as string;
    const userBId = userBRes.body.id as string;

    const cookieA = await login(userAEmail, password);
    const cookieB = await login(userBEmail, password);

    const listingRes = await authedPost('/listings', cookieA, {
      description: 'Listing for messages flow testing.',
      price: 500,
      location: 'UB',
      category: 'services',
    }).expect(201);

    const listingId = listingRes.body.id as string;

    const messageContent = 'Hello from A to B';
    const messageRes = await authedPost('/messages', cookieA, {
      recipientId: userBId,
      listingId,
      content: messageContent,
    }).expect(201);

    const messageId = messageRes.body.id as string;
    expect(messageId).toBeTruthy();

    const threadsRes = await authedGet('/messages/threads', cookieB).expect(
      200,
    );
    const thread = threadsRes.body.find(
      (item: { senderId: string; recipientId: string }) =>
        item.senderId === userAId || item.recipientId === userAId,
    );
    expect(thread).toBeTruthy();
    const partnerId =
      thread.senderId === userBId ? thread.recipientId : thread.senderId;
    expect(partnerId).toBe(userAId);
    expect(thread.content).toBe(messageContent);

    const conversationRes = await authedGet(
      `/messages/with/${userAId}`,
      cookieB,
    ).expect(200);
    expect(conversationRes.body.length).toBeGreaterThanOrEqual(1);
    expect(conversationRes.body[0].content).toBe(messageContent);

    const readRes = await authedPatch(
      `/messages/${messageId}/read`,
      cookieB,
      {},
    ).expect(200);
    expect(readRes.body.readAt).not.toBeNull();

    const conversationAfter = await authedGet(
      `/messages/with/${userAId}`,
      cookieB,
    ).expect(200);
    const updatedMessage = conversationAfter.body.find(
      (item: { id: string }) => item.id === messageId,
    );
    expect(updatedMessage?.readAt).not.toBeNull();
  });

  it('filters hidden listings from public profile response', async () => {
    const userEmail = `profile-${Date.now()}@example.com`;
    const adminEmail = `admin-${Date.now()}@example.com`;
    const password = 'password123';

    const userRes = await register({
      email: userEmail,
      password,
      firstName: 'Public',
      lastName: 'User',
      phone: '30000000',
      accountType: 'basic',
    }).expect(201);
    const userId = userRes.body.id as string;

    const userCookie = await login(userEmail, password);

    const listing1Res = await authedPost('/listings', userCookie, {
      description: 'Public listing one for profile.',
      price: 1200,
      location: 'UB',
      category: 'services',
    }).expect(201);
    const listing1Id = listing1Res.body.id as string;

    const listing2Res = await authedPost('/listings', userCookie, {
      description: 'Public listing two for profile.',
      price: 1400,
      location: 'UB',
      category: 'services',
    }).expect(201);
    const listing2Id = listing2Res.body.id as string;

    await register({
      email: adminEmail,
      password,
      firstName: 'Admin',
      lastName: 'User',
      phone: '40000000',
      accountType: 'basic',
    }).expect(201);

    await prisma.user.update({
      where: { email: adminEmail },
      data: { isAdmin: true },
    });

    const adminCookie = await login(adminEmail, password);

    await authedPatch(`/admin/listings/${listing2Id}/status`, adminCookie, {
      status: 'HIDDEN',
    }).expect(200);

    const profileRes = await request(app.getHttpServer())
      .get(`/users/${userId}/public`)
      .expect(200);

    const json = JSON.stringify(profileRes.body);
    expect(json).not.toMatch(/"email":/);
    expect(json).not.toMatch(/"phone":/);

    const recentListings = profileRes.body.recentListings as Array<{
      id: string;
    }>;
    expect(recentListings.some((item) => item.id === listing1Id)).toBe(true);
    expect(recentListings.some((item) => item.id === listing2Id)).toBe(false);
  });
});
