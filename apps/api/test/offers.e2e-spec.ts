import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { prisma } from './utils/e2e-database';
import { createTestApp } from './utils/create-test-app';

describe('Offers (e2e)', () => {
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
    if (!cookieHeader) throw new Error('Missing auth cookie');
    return cookieHeader.split(';')[0];
  };

  const authedGet = (path: string, cookie: string) =>
    request(app.getHttpServer()).get(path).set('Cookie', cookie);

  const authedPost = (
    path: string,
    cookie: string,
    body: Record<string, unknown>,
  ) => request(app.getHttpServer()).post(path).set('Cookie', cookie).send(body);

  const authedPatch = (path: string, cookie: string) =>
    request(app.getHttpServer()).patch(path).set('Cookie', cookie);

  const setup = async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const password = 'password123';
    const clientEmail = `offer-client-${suffix}@example.com`;
    const providerEmail = `offer-provider-${suffix}@example.com`;

    const clientRes = await registerAndVerify({
      email: clientEmail,
      password,
      firstName: 'Client',
      lastName: 'User',
      phone: '11111111',
      accountType: 'basic',
    });

    const providerRes = await registerAndVerify({
      email: providerEmail,
      password,
      firstName: 'Provider',
      lastName: 'User',
      phone: '22222222',
      accountType: 'basic',
    });

    await prisma.user.update({
      where: { email: providerEmail },
      data: { role: 'PROVIDER' },
    });

    const clientCookie = await login(clientEmail, password);
    const providerCookie = await login(providerEmail, password);

    const listingRes = await authedPost('/listings', clientCookie, {
      description: 'Listing for offers test',
      price: 5000,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    return {
      clientId: clientRes.body.id as string,
      providerId: providerRes.body.id as string,
      listingId: listingRes.body.id as string,
      clientCookie,
      providerCookie,
    };
  };

  it('provider creates an offer on a listing', async () => {
    const ctx = await setup();

    const res = await authedPost(
      `/offers/listing/${ctx.listingId}`,
      ctx.providerCookie,
      { price: 3000, message: 'I can do this for 3000' },
    ).expect(201);

    expect(res.body.listingId).toBe(ctx.listingId);
    expect(res.body.providerId).toBe(ctx.providerId);
    expect(res.body.price).toBe(3000);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.provider).toBeTruthy();
    expect(res.body.listing).toBeTruthy();
  });

  it('client (non-provider) cannot create an offer', async () => {
    const ctx = await setup();

    // Create a second listing by provider so client can try to offer on it
    await prisma.user.update({
      where: { id: ctx.providerId },
      data: { role: 'BOTH' },
    });
    const providerListingRes = await authedPost(
      '/listings',
      ctx.providerCookie,
      {
        description: 'Provider listing for test',
        price: 2000,
        location: 'UB',
        category: 'tutoring',
      },
    ).expect(201);

    await authedPost(
      `/offers/listing/${providerListingRes.body.id}`,
      ctx.clientCookie,
      { price: 1500, message: 'I want to offer' },
    ).expect(403);
  });

  it('cannot create an offer on own listing', async () => {
    const ctx = await setup();

    // Make client also a provider
    await prisma.user.update({
      where: { id: ctx.clientId },
      data: { role: 'BOTH' },
    });

    await authedPost(
      `/offers/listing/${ctx.listingId}`,
      ctx.clientCookie,
      { price: 1500, message: 'Offering on my own listing' },
    ).expect(400);
  });

  it('prevents duplicate pending offer on same listing', async () => {
    const ctx = await setup();

    await authedPost(`/offers/listing/${ctx.listingId}`, ctx.providerCookie, {
      price: 3000,
      message: 'First offer',
    }).expect(201);

    await authedPost(`/offers/listing/${ctx.listingId}`, ctx.providerCookie, {
      price: 4000,
      message: 'Second offer',
    }).expect(409);
  });

  it('returns sent offers', async () => {
    const ctx = await setup();

    await authedPost(`/offers/listing/${ctx.listingId}`, ctx.providerCookie, {
      price: 3000,
      message: 'My offer',
    }).expect(201);

    const res = await authedGet('/offers/sent', ctx.providerCookie).expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].providerId).toBe(ctx.providerId);
  });

  it('returns received offers', async () => {
    const ctx = await setup();

    await authedPost(`/offers/listing/${ctx.listingId}`, ctx.providerCookie, {
      price: 3000,
      message: 'Offer for you',
    }).expect(201);

    const res = await authedGet(
      '/offers/received',
      ctx.clientCookie,
    ).expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].listingId).toBe(ctx.listingId);
  });

  it('listing owner can view offers on their listing', async () => {
    const ctx = await setup();

    await authedPost(`/offers/listing/${ctx.listingId}`, ctx.providerCookie, {
      price: 3000,
      message: 'My offer',
    }).expect(201);

    const res = await authedGet(
      `/offers/listing/${ctx.listingId}`,
      ctx.clientCookie,
    ).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it('non-owner cannot view offers on a listing', async () => {
    const ctx = await setup();

    await authedGet(
      `/offers/listing/${ctx.listingId}`,
      ctx.providerCookie,
    ).expect(403);
  });

  it('returns offer detail', async () => {
    const ctx = await setup();

    const offerRes = await authedPost(
      `/offers/listing/${ctx.listingId}`,
      ctx.providerCookie,
      { price: 3000, message: 'Detail test' },
    ).expect(201);

    const res = await authedGet(
      `/offers/${offerRes.body.id}`,
      ctx.providerCookie,
    ).expect(200);

    expect(res.body.id).toBe(offerRes.body.id);
    expect(res.body.provider).toBeTruthy();
    expect(res.body.listing).toBeTruthy();
  });

  it('cancels a pending offer', async () => {
    const ctx = await setup();

    const offerRes = await authedPost(
      `/offers/listing/${ctx.listingId}`,
      ctx.providerCookie,
      { price: 3000, message: 'Will cancel' },
    ).expect(201);

    const res = await authedPatch(
      `/offers/${offerRes.body.id}/cancel`,
      ctx.providerCookie,
    ).expect(200);

    expect(res.body.status).toBe('CANCELLED');
  });

  it('cannot cancel a non-pending offer', async () => {
    const ctx = await setup();

    const offerRes = await authedPost(
      `/offers/listing/${ctx.listingId}`,
      ctx.providerCookie,
      { price: 3000, message: 'Will cancel twice' },
    ).expect(201);

    await authedPatch(
      `/offers/${offerRes.body.id}/cancel`,
      ctx.providerCookie,
    ).expect(200);

    await authedPatch(
      `/offers/${offerRes.body.id}/cancel`,
      ctx.providerCookie,
    ).expect(400);
  });

  it('creates a notification for the listing owner', async () => {
    const ctx = await setup();

    await authedPost(`/offers/listing/${ctx.listingId}`, ctx.providerCookie, {
      price: 3000,
      message: 'Check notification',
    }).expect(201);

    const notifs = await prisma.notification.findMany({
      where: { userId: ctx.clientId },
    });

    expect(notifs).toHaveLength(1);
    expect(notifs[0].type).toBe('NEW_OFFER');
    expect(notifs[0].title).toBe('Nouvelle offre');
  });
});
