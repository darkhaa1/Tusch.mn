import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { prisma } from './utils/e2e-database';
import { createTestApp } from './utils/create-test-app';

describe('Notifications (e2e)', () => {
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
  }) => request(app.getHttpServer()).post('/auth/register').send(payload);

  const login = async (email: string, password: string) => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    const cookieHeader = res.headers['set-cookie']?.[0];
    if (!cookieHeader) throw new Error('Missing auth cookie');
    return cookieHeader.split(';')[0];
  };

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

  const setupMessageScenario = async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const password = 'password123';

    await registerAndVerify({
      email: `notif-sender-${suffix}@example.com`,
      password,
      firstName: 'Sender',
      lastName: 'User',
      phone: '11111111',
      accountType: 'basic',
    });

    const recipientRes = await registerAndVerify({
      email: `notif-recipient-${suffix}@example.com`,
      password,
      firstName: 'Recipient',
      lastName: 'User',
      phone: '22222222',
      accountType: 'basic',
    });

    const senderCookie = await login(`notif-sender-${suffix}@example.com`, password);
    const recipientCookie = await login(
      `notif-recipient-${suffix}@example.com`,
      password,
    );

    const listingRes = await authedPost('/listings', senderCookie, {
      description: `Notification listing ${suffix}`,
      price: 1200,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    return {
      recipientId: recipientRes.body.id as string,
      senderCookie,
      recipientCookie,
      listingId: listingRes.body.id as string,
    };
  };

  it('creates a notification when a message is sent', async () => {
    const scenario = await setupMessageScenario();

    await authedPost('/messages', scenario.senderCookie, {
      recipientId: scenario.recipientId,
      listingId: scenario.listingId,
      content: 'New message for notification test',
    }).expect(201);

    const notificationsRes = await authedGet(
      '/notifications?page=1&limit=10',
      scenario.recipientCookie,
    ).expect(200);

    expect(notificationsRes.body.total).toBe(1);
    expect(notificationsRes.body.unreadCount).toBe(1);
    expect(notificationsRes.body.items).toHaveLength(1);
    expect(notificationsRes.body.items[0].type).toBe('NEW_MESSAGE');
    expect(notificationsRes.body.items[0].title).toBe('New message');
    expect(notificationsRes.body.items[0].readAt).toBeNull();
  });

  it('marks a single notification as read', async () => {
    const scenario = await setupMessageScenario();

    await authedPost('/messages', scenario.senderCookie, {
      recipientId: scenario.recipientId,
      listingId: scenario.listingId,
      content: 'Single read test message',
    }).expect(201);

    const listBefore = await authedGet('/notifications', scenario.recipientCookie).expect(200);
    const notificationId = listBefore.body.items[0].id as string;
    expect(listBefore.body.unreadCount).toBe(1);

    const markReadRes = await authedPatch(
      `/notifications/${notificationId}/read`,
      scenario.recipientCookie,
      {},
    ).expect(200);
    expect(markReadRes.body.readAt).toBeTruthy();

    const listAfter = await authedGet('/notifications', scenario.recipientCookie).expect(200);
    expect(listAfter.body.unreadCount).toBe(0);
    expect(listAfter.body.items[0].readAt).toBeTruthy();
  });

  it('marks all notifications as read', async () => {
    const scenario = await setupMessageScenario();

    await authedPost('/messages', scenario.senderCookie, {
      recipientId: scenario.recipientId,
      listingId: scenario.listingId,
      content: 'Message one for mark-all',
    }).expect(201);

    await authedPost('/messages', scenario.senderCookie, {
      recipientId: scenario.recipientId,
      listingId: scenario.listingId,
      content: 'Message two for mark-all',
    }).expect(201);

    const before = await authedGet('/notifications', scenario.recipientCookie).expect(200);
    expect(before.body.total).toBe(2);
    expect(before.body.unreadCount).toBe(2);

    await authedPatch('/notifications/read-all', scenario.recipientCookie, {}).expect(200);

    const after = await authedGet('/notifications', scenario.recipientCookie).expect(200);
    expect(after.body.unreadCount).toBe(0);
    expect(after.body.items.every((item: { readAt: string | null }) => !!item.readAt)).toBe(true);
  });

  it('returns unreadCount independently from pagination', async () => {
    const scenario = await setupMessageScenario();

    await authedPost('/messages', scenario.senderCookie, {
      recipientId: scenario.recipientId,
      listingId: scenario.listingId,
      content: 'Unread count one',
    }).expect(201);
    await authedPost('/messages', scenario.senderCookie, {
      recipientId: scenario.recipientId,
      listingId: scenario.listingId,
      content: 'Unread count two',
    }).expect(201);
    await authedPost('/messages', scenario.senderCookie, {
      recipientId: scenario.recipientId,
      listingId: scenario.listingId,
      content: 'Unread count three',
    }).expect(201);

    const pageOne = await authedGet(
      '/notifications?page=1&limit=1',
      scenario.recipientCookie,
    ).expect(200);
    expect(pageOne.body.items).toHaveLength(1);
    expect(pageOne.body.total).toBe(3);
    expect(pageOne.body.unreadCount).toBe(3);

    const notificationId = pageOne.body.items[0].id as string;
    await authedPatch(
      `/notifications/${notificationId}/read`,
      scenario.recipientCookie,
      {},
    ).expect(200);

    const afterRead = await authedGet(
      '/notifications?page=1&limit=1',
      scenario.recipientCookie,
    ).expect(200);
    expect(afterRead.body.items).toHaveLength(1);
    expect(afterRead.body.total).toBe(3);
    expect(afterRead.body.unreadCount).toBe(2);
  });
});
