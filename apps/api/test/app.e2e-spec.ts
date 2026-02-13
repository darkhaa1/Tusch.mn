import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { createHash, randomBytes } from 'crypto';
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

  const verifyEmail = (token: string) =>
    request(app.getHttpServer())
      .post('/auth/verify-email')
      .send({ token });

  const resendVerification = (cookie: string) =>
    authedPost('/auth/resend-verification', cookie, {});

  const hashToken = (token: string) =>
    createHash('sha256').update(token).digest('hex');

  const generateToken = () => randomBytes(32).toString('hex');

  const setEmailVerifyToken = async (
    email: string,
    rawToken: string,
    expiration = new Date(Date.now() + 24 * 60 * 60 * 1000),
  ) => {
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: false,
        emailVerifyToken: hashToken(rawToken),
        emailVerifyTokenExp: expiration,
      },
    });
  };

  const setResetToken = async (
    email: string,
    rawToken: string,
    expiration = new Date(Date.now() + 60 * 60 * 1000),
  ) => {
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashToken(rawToken),
        resetTokenExp: expiration,
      },
    });
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

  const authedDelete = (path: string, cookie: string) =>
    request(app.getHttpServer()).delete(path).set('Cookie', cookie);

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

  it('marks newly registered users as unverified', async () => {
    const email = `unverified-${Date.now()}@example.com`;
    const password = 'password123';

    const res = await register({
      email,
      password,
      firstName: 'New',
      lastName: 'User',
      phone: '11100011',
      accountType: 'basic',
    }).expect(201);

    expect(res.body.emailVerified).toBe(false);
  });

  it('verifies email with a valid token', async () => {
    const email = `verify-${Date.now()}@example.com`;
    const password = 'password123';

    const res = await register({
      email,
      password,
      firstName: 'Verify',
      lastName: 'User',
      phone: '11100022',
      accountType: 'basic',
    }).expect(201);

    const tokenFromResponse = res.body.token as string | undefined;
    const token = tokenFromResponse ?? generateToken();
    if (!tokenFromResponse) {
      await setEmailVerifyToken(email, token);
    }

    await verifyEmail(token).expect(201);

    const updated = await prisma.user.findUnique({ where: { email } });
    expect(updated?.emailVerified).toBe(true);
  });

  it('rejects invalid or expired email verification tokens', async () => {
    await verifyEmail('invalid-token').expect(400);
  });

  it('resends verification token for unverified users', async () => {
    const email = `resend-${Date.now()}@example.com`;
    const password = 'password123';

    const res = await register({
      email,
      password,
      firstName: 'Resend',
      lastName: 'User',
      phone: '11100033',
      accountType: 'basic',
    }).expect(201);

    const firstToken = res.body.token as string | undefined;
    const beforeUser = await prisma.user.findUnique({
      where: { email },
      select: { emailVerifyToken: true },
    });
    const cookie = await login(email, password);

    const resendRes = await resendVerification(cookie).expect(201);
    const resentToken = resendRes.body.token as string | undefined;
    const afterUser = await prisma.user.findUnique({
      where: { email },
      select: { emailVerifyToken: true },
    });

    expect(afterUser?.emailVerifyToken).toBeTruthy();
    if (beforeUser?.emailVerifyToken && afterUser?.emailVerifyToken) {
      expect(afterUser.emailVerifyToken).not.toBe(beforeUser.emailVerifyToken);
    }
    if (firstToken && resentToken) {
      expect(resentToken).not.toBe(firstToken);
    }
  });

  it('prevents resend for already verified users', async () => {
    const email = `verified-${Date.now()}@example.com`;
    const password = 'password123';

    await register({
      email,
      password,
      firstName: 'Verified',
      lastName: 'User',
      phone: '11100044',
      accountType: 'basic',
    }).expect(201);

    await markEmailVerified(email);
    const cookie = await login(email, password);

    await resendVerification(cookie).expect(400);
  });

  it('blocks unverified users from creating listings', async () => {
    const email = `blocked-listing-${Date.now()}@example.com`;
    const password = 'password123';

    await register({
      email,
      password,
      firstName: 'Blocked',
      lastName: 'Listing',
      phone: '11100055',
      accountType: 'basic',
    }).expect(201);

    const cookie = await login(email, password);

    await authedPost('/listings', cookie, {
      description: 'Should be blocked.',
      price: 1200,
      location: 'UB',
      category: 'services',
    }).expect(403);
  });

  it('blocks unverified users from sending messages', async () => {
    const verifiedEmail = `msg-verified-${Date.now()}@example.com`;
    const unverifiedEmail = `msg-unverified-${Date.now()}@example.com`;
    const password = 'password123';

    const verifiedRes = await registerAndVerify({
      email: verifiedEmail,
      password,
      firstName: 'Verified',
      lastName: 'Sender',
      phone: '11100066',
      accountType: 'basic',
    });

    await register({
      email: unverifiedEmail,
      password,
      firstName: 'Unverified',
      lastName: 'Sender',
      phone: '11100077',
      accountType: 'basic',
    }).expect(201);

    const verifiedId = verifiedRes.body.id as string;
    const verifiedCookie = await login(verifiedEmail, password);
    const unverifiedCookie = await login(unverifiedEmail, password);

    const listingRes = await authedPost('/listings', verifiedCookie, {
      description: 'Listing for unverified messaging test.',
      price: 900,
      location: 'UB',
      category: 'services',
    }).expect(201);

    await authedPost('/messages', unverifiedCookie, {
      recipientId: verifiedId,
      listingId: listingRes.body.id as string,
      content: 'Should be blocked.',
    }).expect(403);
  });

  it('auto-verifies OAuth users', async () => {
    const email = `oauth-${Date.now()}@example.com`;

    await request(app.getHttpServer())
      .post('/auth/oauth-login')
      .send({
        email,
        firstName: 'OAuth',
        lastName: 'User',
        provider: 'google',
        avatarUrl: null,
      })
      .expect(201);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.emailVerified).toBe(true);
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
      data: {
        isAdmin: true,
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
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
      data: {
        isAdmin: true,
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyTokenExp: null,
      },
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

  it('searches listings by description and location with filters', async () => {
    const email = `search-${Date.now()}@example.com`;
    const password = 'password123';
    const marker = `kw-${Date.now()}`;
    const cleaningKey = `cleaning-${marker}`;
    const plumbingKey = `plumbing-${marker}`;
    const locationKey = `loc-${marker}`;
    const caseLocation = `CaseTown-${marker}`;
    const hiddenKey = `hidden-${marker}`;

    await registerAndVerify({
      email,
      password,
      firstName: 'Search',
      lastName: 'Tester',
      phone: '33344455',
      accountType: 'basic',
    });

    const cookie = await login(email, password);

    const listingA = await authedPost('/listings', cookie, {
      description: `Alpha ${cleaningKey}`,
      price: 1200,
      location: caseLocation,
      category: 'services',
    }).expect(201);

    const listingB = await authedPost('/listings', cookie, {
      description: `Beta ${plumbingKey}`,
      price: 1500,
      location: 'Erdenet',
      category: 'repairs',
    }).expect(201);

    const listingC = await authedPost('/listings', cookie, {
      description: `Gamma ${cleaningKey}`,
      price: 900,
      location: locationKey,
      category: 'home',
    }).expect(201);

    const hiddenListing = await authedPost('/listings', cookie, {
      description: `Hidden ${hiddenKey}`,
      price: 800,
      location: 'Hiddenville',
      category: 'services',
    }).expect(201);

    await prisma.listing.update({
      where: { id: hiddenListing.body.id as string },
      data: { status: 'HIDDEN' },
    });

    const byDescription = await request(app.getHttpServer())
      .get(`/listings?search=${encodeURIComponent(plumbingKey)}`)
      .expect(200);

    expect(byDescription.body.total).toBe(1);
    expect(byDescription.body.items[0].id).toBe(listingB.body.id);

    const byLocation = await request(app.getHttpServer())
      .get(`/listings?search=${encodeURIComponent(locationKey)}`)
      .expect(200);

    expect(byLocation.body.total).toBe(1);
    expect(byLocation.body.items[0].id).toBe(listingC.body.id);

    const byCaseInsensitive = await request(app.getHttpServer())
      .get(`/listings?search=${encodeURIComponent(caseLocation.toLowerCase())}`)
      .expect(200);

    expect(byCaseInsensitive.body.items.some((item: { id: string }) => item.id === listingA.body.id)).toBe(true);

    const bySearchAndCategory = await request(app.getHttpServer())
      .get(
        `/listings?search=${encodeURIComponent(cleaningKey)}&category=services`,
      )
      .expect(200);

    expect(bySearchAndCategory.body.total).toBe(1);
    expect(bySearchAndCategory.body.items[0].id).toBe(listingA.body.id);

    const noSearch = await request(app.getHttpServer())
      .get('/listings')
      .expect(200);
    const emptySearch = await request(app.getHttpServer())
      .get('/listings?search=')
      .expect(200);

    expect(emptySearch.body.total).toBe(noSearch.body.total);

    const noMatches = await request(app.getHttpServer())
      .get(`/listings?search=${encodeURIComponent(`nomatch-${marker}`)}`)
      .expect(200);

    expect(noMatches.body.total).toBe(0);
    expect(noMatches.body.items.length).toBe(0);

    const hiddenSearch = await request(app.getHttpServer())
      .get(`/listings?search=${encodeURIComponent(hiddenKey)}`)
      .expect(200);

    expect(hiddenSearch.body.total).toBe(0);
    expect(hiddenSearch.body.items.length).toBe(0);
  });

  it('filters listings by price range and location', async () => {
    const marker = `pf-${Date.now()}`;
    const email = `pricefilter-${marker}@example.com`;
    const password = 'password123';
    const loc1 = `CityA-${marker}`;
    const loc2 = `CityB-${marker}`;

    await registerAndVerify({
      email,
      password,
      firstName: 'Price',
      lastName: 'Tester',
      phone: '55566677',
      accountType: 'basic',
    });

    const cookie = await login(email, password);

    const listing1 = await authedPost('/listings', cookie, {
      description: `Cheap ${marker}`,
      price: 500,
      location: loc1,
      category: 'services',
    }).expect(201);

    const listing2 = await authedPost('/listings', cookie, {
      description: `Medium ${marker}`,
      price: 5000,
      location: loc2,
      category: 'services',
    }).expect(201);

    const listing3 = await authedPost('/listings', cookie, {
      description: `Expensive ${marker}`,
      price: 50000,
      location: loc1,
      category: 'repairs',
    }).expect(201);

    // minPrice only
    const minOnly = await request(app.getHttpServer())
      .get(`/listings?search=${marker}&minPrice=1000`)
      .expect(200);
    expect(minOnly.body.total).toBe(2);
    expect(
      minOnly.body.items.every((i: { price: number }) => i.price >= 1000),
    ).toBe(true);

    // maxPrice only
    const maxOnly = await request(app.getHttpServer())
      .get(`/listings?search=${marker}&maxPrice=5000`)
      .expect(200);
    expect(maxOnly.body.total).toBe(2);
    expect(
      maxOnly.body.items.every((i: { price: number }) => i.price <= 5000),
    ).toBe(true);

    // price range
    const range = await request(app.getHttpServer())
      .get(`/listings?search=${marker}&minPrice=1000&maxPrice=10000`)
      .expect(200);
    expect(range.body.total).toBe(1);
    expect(range.body.items[0].id).toBe(listing2.body.id);

    // location filter
    const byLocation = await request(app.getHttpServer())
      .get(
        `/listings?search=${marker}&location=${encodeURIComponent(loc1)}`,
      )
      .expect(200);
    expect(byLocation.body.total).toBe(2);

    // location filter case-insensitive
    const byLocationLower = await request(app.getHttpServer())
      .get(
        `/listings?search=${marker}&location=${encodeURIComponent(loc1.toLowerCase())}`,
      )
      .expect(200);
    expect(byLocationLower.body.total).toBe(2);

    // combined: price + location + category
    const combined = await request(app.getHttpServer())
      .get(
        `/listings?search=${marker}&minPrice=100&maxPrice=50000&location=${encodeURIComponent(loc1)}&category=services`,
      )
      .expect(200);
    expect(combined.body.total).toBe(1);
    expect(combined.body.items[0].id).toBe(listing1.body.id);

    // validation: maxPrice < minPrice → 400
    await request(app.getHttpServer())
      .get(`/listings?minPrice=5000&maxPrice=100`)
      .expect(400);

    // GET /listings/locations returns distinct locations
    const locationsRes = await request(app.getHttpServer())
      .get('/listings/locations')
      .expect(200);
    expect(Array.isArray(locationsRes.body)).toBe(true);
    expect(locationsRes.body).toContain(loc1);
    expect(locationsRes.body).toContain(loc2);

    // hide a listing and verify its location still shows (other active listing has same location)
    await prisma.listing.update({
      where: { id: listing3.body.id as string },
      data: { status: 'HIDDEN' },
    });

    // loc1 still in locations because listing1 is still active
    const locationsAfterHide = await request(app.getHttpServer())
      .get('/listings/locations')
      .expect(200);
    expect(locationsAfterHide.body).toContain(loc1);

    // hide listing1 too, now loc1 should be gone
    await prisma.listing.update({
      where: { id: listing1.body.id as string },
      data: { status: 'HIDDEN' },
    });

    const locationsAfterHideAll = await request(app.getHttpServer())
      .get('/listings/locations')
      .expect(200);
    expect(locationsAfterHideAll.body).not.toContain(loc1);
    expect(locationsAfterHideAll.body).toContain(loc2);
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

    await markEmailVerified(userAEmail);
    await markEmailVerified(userBEmail);

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
    expect(conversationRes.body.items.length).toBeGreaterThanOrEqual(1);
    expect(conversationRes.body.items[0].content).toBe(messageContent);

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
    const updatedMessage = conversationAfter.body.items.find(
      (item: { id: string }) => item.id === messageId,
    );
    expect(updatedMessage?.readAt).not.toBeNull();
  });

  it('returns correct unread message count', async () => {
    const senderEmail = `unread-sender-${Date.now()}@example.com`;
    const recipientEmail = `unread-recipient-${Date.now()}@example.com`;
    const bystanderEmail = `unread-bystander-${Date.now()}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email: senderEmail,
      password,
      firstName: 'Sender',
      lastName: 'User',
      phone: '70000001',
      accountType: 'basic',
    });

    const recipientRes = await registerAndVerify({
      email: recipientEmail,
      password,
      firstName: 'Recipient',
      lastName: 'User',
      phone: '70000002',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: bystanderEmail,
      password,
      firstName: 'Bystander',
      lastName: 'User',
      phone: '70000003',
      accountType: 'basic',
    });

    const senderCookie = await login(senderEmail, password);
    const recipientCookie = await login(recipientEmail, password);
    const bystanderCookie = await login(bystanderEmail, password);
    const recipientId = recipientRes.body.id as string;

    // Create a listing for the message flow
    const listingRes = await authedPost('/listings', senderCookie, {
      description: 'Listing for unread count test.',
      price: 100,
      location: 'UB',
      category: 'services',
    }).expect(201);
    const listingId = listingRes.body.id as string;

    // Unread count starts at 0
    const res0 = await authedGet('/messages/unread-count', recipientCookie).expect(200);
    expect(res0.body.count).toBe(0);

    // Send 2 messages to recipient
    const msg1 = await authedPost('/messages', senderCookie, {
      recipientId,
      listingId,
      content: 'First unread message',
    }).expect(201);

    await authedPost('/messages', senderCookie, {
      recipientId,
      listingId,
      content: 'Second unread message',
    }).expect(201);

    // Unread count is 2
    const res2 = await authedGet('/messages/unread-count', recipientCookie).expect(200);
    expect(res2.body.count).toBe(2);

    // Mark one message as read — count decreases
    await authedPatch(`/messages/${msg1.body.id}/read`, recipientCookie, {}).expect(200);
    const res1 = await authedGet('/messages/unread-count', recipientCookie).expect(200);
    expect(res1.body.count).toBe(1);

    // Bystander count is still 0 (only counts messages where user is recipient)
    const resBystander = await authedGet('/messages/unread-count', bystanderCookie).expect(200);
    expect(resBystander.body.count).toBe(0);
  });

  it('paginates conversation messages', async () => {
    const userAEmail = `conv-a-${Date.now()}@example.com`;
    const userBEmail = `conv-b-${Date.now()}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email: userAEmail,
      password,
      firstName: 'ConvA',
      lastName: 'User',
      phone: '80000001',
      accountType: 'basic',
    });

    const userBRes = await registerAndVerify({
      email: userBEmail,
      password,
      firstName: 'ConvB',
      lastName: 'User',
      phone: '80000002',
      accountType: 'basic',
    });

    const cookieA = await login(userAEmail, password);
    const userBId = userBRes.body.id as string;

    const listingRes = await authedPost('/listings', cookieA, {
      description: 'Listing for conv pagination test.',
      price: 100,
      location: 'UB',
      category: 'services',
    }).expect(201);
    const listingId = listingRes.body.id as string;

    // Send 5 messages from A to B
    for (let i = 1; i <= 5; i++) {
      await authedPost('/messages', cookieA, {
        recipientId: userBId,
        listingId,
        content: `Message ${i}`,
      }).expect(201);
    }

    // Page 1 with limit 2: returns 2 items, hasMore true, total 5
    const page1 = await authedGet(
      `/messages/with/${userBId}?page=1&limit=2`,
      cookieA,
    ).expect(200);
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.total).toBe(5);
    expect(page1.body.hasMore).toBe(true);
    expect(page1.body.page).toBe(1);
    expect(page1.body.limit).toBe(2);

    // Page 3 with limit 2: returns 1 item, hasMore false
    const page3 = await authedGet(
      `/messages/with/${userBId}?page=3&limit=2`,
      cookieA,
    ).expect(200);
    expect(page3.body.items).toHaveLength(1);
    expect(page3.body.hasMore).toBe(false);

    // Default pagination (no params) returns all 5 (limit defaults to 30)
    const defaultPage = await authedGet(
      `/messages/with/${userBId}`,
      cookieA,
    ).expect(200);
    expect(defaultPage.body.items).toHaveLength(5);
    expect(defaultPage.body.total).toBe(5);

    // Messages are sorted by createdAt desc (newest first)
    const items = defaultPage.body.items as Array<{ createdAt: string }>;
    for (let i = 0; i < items.length - 1; i++) {
      expect(new Date(items[i].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(items[i + 1].createdAt).getTime(),
      );
    }
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

    await markEmailVerified(userEmail);

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

  it('creates a review, prevents self-review and duplicate reviews', async () => {
    const userAEmail = `reviewa-${Date.now()}@example.com`;
    const userBEmail = `reviewb-${Date.now()}@example.com`;
    const password = 'password123';

    // Register two users
    const userARes = await register({
      email: userAEmail,
      password,
      firstName: 'Reviewer',
      lastName: 'A',
      phone: '50000000',
      accountType: 'basic',
    }).expect(201);
    const userAId = userARes.body.id as string;

    const userBRes = await register({
      email: userBEmail,
      password,
      firstName: 'Target',
      lastName: 'B',
      phone: '60000000',
      accountType: 'basic',
    }).expect(201);
    const userBId = userBRes.body.id as string;

    const cookieA = await login(userAEmail, password);
    const cookieB = await login(userBEmail, password);

    // Create a review from A to B
    const reviewRes = await authedPost('/reviews', cookieA, {
      targetUserId: userBId,
      rating: 5,
      comment: 'Excellent service!',
    }).expect(201);

    const reviewId = reviewRes.body.id as string;
    expect(reviewRes.body.rating).toBe(5);
    expect(reviewRes.body.comment).toBe('Excellent service!');
    expect(reviewRes.body.reviewer.id).toBe(userAId);

    // Prevent self-review
    await authedPost('/reviews', cookieB, {
      targetUserId: userBId,
      rating: 4,
      comment: 'Self review attempt',
    }).expect(400);

    // Prevent duplicate review
    await authedPost('/reviews', cookieA, {
      targetUserId: userBId,
      rating: 3,
      comment: 'Duplicate attempt',
    }).expect(409);

    // Fetch reviews for user B
    const reviewsRes = await request(app.getHttpServer())
      .get(`/reviews/user/${userBId}`)
      .expect(200);

    expect(reviewsRes.body.items.length).toBe(1);
    expect(reviewsRes.body.items[0].id).toBe(reviewId);
    expect(reviewsRes.body.total).toBe(1);

    // Delete own review
    await authedDelete(`/reviews/${reviewId}`, cookieA).expect(200);

    // Verify deletion
    const reviewsAfterDelete = await request(app.getHttpServer())
      .get(`/reviews/user/${userBId}`)
      .expect(200);

    expect(reviewsAfterDelete.body.items.length).toBe(0);
  });

  it('includes reviews in public profile', async () => {
    const reviewerEmail = `reviewer-${Date.now()}@example.com`;
    const targetEmail = `target-${Date.now()}@example.com`;
    const password = 'password123';

    // Register reviewer
    await register({
      email: reviewerEmail,
      password,
      firstName: 'Reviewer',
      lastName: 'User',
      phone: '70000000',
      accountType: 'basic',
    }).expect(201);

    // Register target
    const targetRes = await register({
      email: targetEmail,
      password,
      firstName: 'Target',
      lastName: 'User',
      phone: '80000000',
      accountType: 'basic',
    }).expect(201);
    const targetId = targetRes.body.id as string;

    const reviewerCookie = await login(reviewerEmail, password);

    // Create review
    await authedPost('/reviews', reviewerCookie, {
      targetUserId: targetId,
      rating: 4,
      comment: 'Great experience!',
    }).expect(201);

    // Fetch public profile
    const profileRes = await request(app.getHttpServer())
      .get(`/users/${targetId}/public`)
      .expect(200);

    expect(profileRes.body.stats.reviewsCount).toBe(1);
    expect(profileRes.body.stats.ratingAvg).toBe(4);
    expect(profileRes.body.reviews.length).toBe(1);
    expect(profileRes.body.reviews[0].rating).toBe(4);
    expect(profileRes.body.reviews[0].comment).toBe('Great experience!');
  });

  it('prevents deleting another user\'s review', async () => {
    const userAEmail = `usera-delete-${Date.now()}@example.com`;
    const userBEmail = `userb-delete-${Date.now()}@example.com`;
    const password = 'password123';

    // Register two users
    await register({
      email: userAEmail,
      password,
      firstName: 'User',
      lastName: 'A',
      phone: '90000000',
      accountType: 'basic',
    }).expect(201);

    const userBRes = await register({
      email: userBEmail,
      password,
      firstName: 'User',
      lastName: 'B',
      phone: '91000000',
      accountType: 'basic',
    }).expect(201);
    const userBId = userBRes.body.id as string;

    const cookieA = await login(userAEmail, password);
    const cookieB = await login(userBEmail, password);

    // A reviews B
    const reviewRes = await authedPost('/reviews', cookieA, {
      targetUserId: userBId,
      rating: 3,
      comment: 'OK service',
    }).expect(201);
    const reviewId = reviewRes.body.id as string;

    // B tries to delete A's review (should fail with 403)
    await authedDelete(`/reviews/${reviewId}`, cookieB).expect(403);

    // Verify review still exists
    const reviewsRes = await request(app.getHttpServer())
      .get(`/reviews/user/${userBId}`)
      .expect(200);
    expect(reviewsRes.body.items.length).toBe(1);
  });

  it('handles pagination for reviews', async () => {
    const reviewerEmail = `paginated-reviewer-${Date.now()}@example.com`;
    const targetEmail = `paginated-target-${Date.now()}@example.com`;
    const password = 'password123';

    // Register reviewer
    await register({
      email: reviewerEmail,
      password,
      firstName: 'Paginated',
      lastName: 'Reviewer',
      phone: '92000000',
      accountType: 'basic',
    }).expect(201);

    // Register target
    const targetRes = await register({
      email: targetEmail,
      password,
      firstName: 'Paginated',
      lastName: 'Target',
      phone: '93000000',
      accountType: 'basic',
    }).expect(201);
    const targetId = targetRes.body.id as string;

    const reviewerCookie = await login(reviewerEmail, password);

    // Create review
    await authedPost('/reviews', reviewerCookie, {
      targetUserId: targetId,
      rating: 5,
      comment: 'Test pagination',
    }).expect(201);

    // Test pagination query params
    const page1 = await request(app.getHttpServer())
      .get(`/reviews/user/${targetId}?page=1&limit=10`)
      .expect(200);

    expect(page1.body.page).toBe(1);
    expect(page1.body.limit).toBe(10);
    expect(page1.body.total).toBe(1);
    expect(page1.body.items.length).toBe(1);
  });

  it('completes forgot password and reset password flow', async () => {
    const email = `reset-${Date.now()}@example.com`;
    const oldPassword = 'oldpass123';
    const newPassword = 'newpass456';

    // Register user
    await register({
      email,
      password: oldPassword,
      firstName: 'Reset',
      lastName: 'User',
      phone: '12345678',
      accountType: 'basic',
    }).expect(201);

    // Request password reset
    const forgotRes = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email })
      .expect(201);

    expect(forgotRes.body.success).toBe(true);
    const tokenFromResponse = forgotRes.body.token as string | undefined;
    if (tokenFromResponse) {
      expect(typeof tokenFromResponse).toBe('string');
      expect(tokenFromResponse.length).toBe(64); // 32 bytes = 64 hex characters
    }
    const afterForgot = await prisma.user.findUnique({
      where: { email },
      select: { resetToken: true },
    });
    expect(afterForgot?.resetToken).toBeTruthy();

    const token = tokenFromResponse ?? generateToken();
    if (!tokenFromResponse) {
      await setResetToken(email, token);
    }

    // Reset password with token
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, newPassword })
      .expect(201);

    // Verify old password doesn't work
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: oldPassword })
      .expect(401);

    // Verify new password works
    const cookie = await login(email, newPassword);
    const meRes = await authedGet('/auth/me', cookie).expect(200);
    expect(meRes.body.user.email).toBe(email);
  });

  it('rejects expired reset token', async () => {
    const email = `expired-${Date.now()}@example.com`;

    await register({
      email,
      password: 'password123',
      firstName: 'Expired',
      lastName: 'User',
      phone: '87654321',
      accountType: 'basic',
    }).expect(201);

    const token = generateToken();
    await setResetToken(email, token, new Date(Date.now() - 1000)); // 1 second ago

    // Attempt reset with expired token
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, newPassword: 'newpass123' })
      .expect(401);
  });

  it('rejects invalid reset token', async () => {
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: 'invalid-token-12345', newPassword: 'newpass123' })
      .expect(401);
  });

  it('returns success for non-existent email to prevent enumeration', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' })
      .expect(201);

    expect(res.body.success).toBe(true);
    // Token might be undefined for non-existent users
  });

  it('prevents token reuse after successful reset', async () => {
    const email = `reuse-${Date.now()}@example.com`;

    await register({
      email,
      password: 'password123',
      firstName: 'Reuse',
      lastName: 'Test',
      phone: '11111111',
      accountType: 'basic',
    }).expect(201);

    const token = generateToken();
    await setResetToken(email, token);

    // First reset succeeds
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, newPassword: 'newpass123' })
      .expect(201);

    // Second reset with same token fails
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token, newPassword: 'anotherpass456' })
      .expect(401);
  });

  it('paginates and searches users', async () => {
    const marker = `usrpg-${Date.now()}`;
    const password = 'password123';

    // Register 3 users with distinct names
    await registerAndVerify({
      email: `${marker}-alpha@example.com`,
      password,
      firstName: 'AlphaFirst',
      lastName: 'AlphaLast',
      phone: '90000001',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: `${marker}-beta@example.com`,
      password,
      firstName: 'BetaFirst',
      lastName: 'BetaLast',
      phone: '90000002',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: `${marker}-gamma@example.com`,
      password,
      firstName: 'GammaFirst',
      lastName: 'GammaLast',
      phone: '90000003',
      accountType: 'basic',
    });

    const cookie = await login(`${marker}-alpha@example.com`, password);

    // Default pagination returns items with total
    const defaultRes = await authedGet('/users', cookie).expect(200);
    expect(defaultRes.body.items).toBeDefined();
    expect(defaultRes.body.total).toBeGreaterThanOrEqual(3);
    expect(defaultRes.body.page).toBe(1);
    expect(defaultRes.body.limit).toBe(20);

    // Page 1 with limit 2
    const page1 = await authedGet('/users?page=1&limit=2', cookie).expect(200);
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.total).toBeGreaterThanOrEqual(3);

    // Page 2 with limit 2 returns more items
    const page2 = await authedGet('/users?page=2&limit=2', cookie).expect(200);
    expect(page2.body.items.length).toBeGreaterThanOrEqual(1);

    // Search by firstName returns matching user
    const searchRes = await authedGet(
      `/users?search=AlphaFirst`,
      cookie,
    ).expect(200);
    expect(searchRes.body.items.length).toBeGreaterThanOrEqual(1);
    expect(
      searchRes.body.items.some(
        (u: { firstName: string }) => u.firstName === 'AlphaFirst',
      ),
    ).toBe(true);

    // Search is case-insensitive
    const caseRes = await authedGet(
      `/users?search=alphafirst`,
      cookie,
    ).expect(200);
    expect(caseRes.body.items.length).toBeGreaterThanOrEqual(1);
    expect(
      caseRes.body.items.some(
        (u: { firstName: string }) => u.firstName === 'AlphaFirst',
      ),
    ).toBe(true);

    // passwordHash is never in the response
    for (const user of defaultRes.body.items) {
      expect(user.password).toBeUndefined();
      expect(user.resetToken).toBeUndefined();
      expect(user.resetTokenExp).toBeUndefined();
      expect(user.emailVerifyToken).toBeUndefined();
      expect(user.emailVerifyTokenExp).toBeUndefined();
    }
  });
});
