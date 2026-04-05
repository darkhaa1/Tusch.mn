import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { prisma } from './utils/e2e-database';
import { createTestApp } from './utils/create-test-app';

describe('Favorites (e2e)', () => {
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

  const authedDelete = (path: string, cookie: string) =>
    request(app.getHttpServer()).delete(path).set('Cookie', cookie);

  it('adds and removes listing favorites', async () => {
    const ownerEmail = `owner-${Date.now()}@example.com`;
    const fanEmail = `fan-${Date.now()}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email: ownerEmail,
      password,
      firstName: 'Owner',
      lastName: 'User',
      phone: '10100000',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: fanEmail,
      password,
      firstName: 'Fan',
      lastName: 'User',
      phone: '10100001',
      accountType: 'basic',
    });

    const ownerCookie = await login(ownerEmail, password);
    const fanCookie = await login(fanEmail, password);

    const listingRes = await authedPost('/listings', ownerCookie, {
      description: 'Listing to favorite',
      price: 1200,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    const listingId = listingRes.body.id as string;

    await authedPost(`/favorites/listings/${listingId}`, fanCookie, {}).expect(201);

    const checkRes = await authedGet(
      `/favorites/check/listing/${listingId}`,
      fanCookie,
    ).expect(200);
    expect(checkRes.text).toBe('true');

    await authedDelete(`/favorites/listings/${listingId}`, fanCookie).expect(200);

    const checkAfter = await authedGet(
      `/favorites/check/listing/${listingId}`,
      fanCookie,
    ).expect(200);
    expect(checkAfter.text).toBe('false');
  });

  it('adds and removes provider favorites', async () => {
    const providerEmail = `provider-${Date.now()}@example.com`;
    const fanEmail = `provider-fan-${Date.now()}@example.com`;
    const password = 'password123';

    const providerRes = await registerAndVerify({
      email: providerEmail,
      password,
      firstName: 'Provider',
      lastName: 'User',
      phone: '20200000',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: fanEmail,
      password,
      firstName: 'Fan',
      lastName: 'User',
      phone: '20200001',
      accountType: 'basic',
    });

    const fanCookie = await login(fanEmail, password);
    const providerId = providerRes.body.id as string;

    await authedPost(`/favorites/providers/${providerId}`, fanCookie, {}).expect(201);

    const checkRes = await authedGet(
      `/favorites/check/provider/${providerId}`,
      fanCookie,
    ).expect(200);
    expect(checkRes.text).toBe('true');

    await authedDelete(`/favorites/providers/${providerId}`, fanCookie).expect(200);

    const checkAfter = await authedGet(
      `/favorites/check/provider/${providerId}`,
      fanCookie,
    ).expect(200);
    expect(checkAfter.text).toBe('false');
  });

  it('paginates favorite listings and providers', async () => {
    const ownerEmail = `fav-owner-${Date.now()}@example.com`;
    const owner2Email = `fav-owner2-${Date.now()}@example.com`;
    const fanEmail = `fav-fan-${Date.now()}@example.com`;
    const password = 'password123';

    const ownerCookie = await (async () => {
      await registerAndVerify({
        email: ownerEmail,
        password,
        firstName: 'Owner',
        lastName: 'One',
        phone: '30300000',
        accountType: 'basic',
      });
      return login(ownerEmail, password);
    })();

    const owner2Res = await registerAndVerify({
      email: owner2Email,
      password,
      firstName: 'Owner',
      lastName: 'Two',
      phone: '30300001',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: fanEmail,
      password,
      firstName: 'Fan',
      lastName: 'User',
      phone: '30300002',
      accountType: 'basic',
    });

    const fanCookie = await login(fanEmail, password);

    const listingA = await authedPost('/listings', ownerCookie, {
      description: 'Favorite listing A',
      price: 1000,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    const listingB = await authedPost('/listings', ownerCookie, {
      description: 'Favorite listing B',
      price: 1100,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    await authedPost(`/favorites/listings/${listingA.body.id}`, fanCookie, {}).expect(201);
    await authedPost(`/favorites/listings/${listingB.body.id}`, fanCookie, {}).expect(201);

    const listingsPage = await authedGet(
      '/favorites/listings?page=1&limit=1',
      fanCookie,
    ).expect(200);

    expect(listingsPage.body.items).toHaveLength(1);
    expect(listingsPage.body.total).toBe(2);

    const providerId = owner2Res.body.id as string;
    await authedPost(`/favorites/providers/${providerId}`, fanCookie, {}).expect(201);

    const providersPage = await authedGet(
      '/favorites/providers?page=1&limit=1',
      fanCookie,
    ).expect(200);

    expect(providersPage.body.items).toHaveLength(1);
    expect(providersPage.body.total).toBe(1);
  });

  it('prevents favoriting yourself or your own listing', async () => {
    const email = `self-${Date.now()}@example.com`;
    const password = 'password123';

    const userRes = await registerAndVerify({
      email,
      password,
      firstName: 'Self',
      lastName: 'User',
      phone: '40400000',
      accountType: 'basic',
    });

    const cookie = await login(email, password);
    const userId = userRes.body.id as string;

    await authedPost(`/favorites/providers/${userId}`, cookie, {}).expect(400);

    const listingRes = await authedPost('/listings', cookie, {
      description: 'My own listing',
      price: 1500,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    await authedPost(`/favorites/listings/${listingRes.body.id}`, cookie, {}).expect(400);
  });

  it('includes isFavorited and favoritesCount in listing responses', async () => {
    const ownerEmail = `fav-owner-${Date.now()}@example.com`;
    const fanEmail = `fav-fan-${Date.now()}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email: ownerEmail,
      password,
      firstName: 'Owner',
      lastName: 'Listing',
      phone: '50500000',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: fanEmail,
      password,
      firstName: 'Fan',
      lastName: 'Listing',
      phone: '50500001',
      accountType: 'basic',
    });

    const ownerCookie = await login(ownerEmail, password);
    const fanCookie = await login(fanEmail, password);

    const listingRes = await authedPost('/listings', ownerCookie, {
      description: 'Listing to check favorite state',
      price: 1300,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    const listingId = listingRes.body.id as string;

    await authedPost(`/favorites/listings/${listingId}`, fanCookie, {}).expect(201);

    const listRes = await request(app.getHttpServer())
      .get('/listings')
      .set('Cookie', fanCookie)
      .expect(200);

    const listing = (
      listRes.body.items as Array<{
        id: string;
        isFavorited?: boolean;
        favoritesCount?: number;
      }>
    ).find((item) => item.id === listingId);

    expect(listing?.isFavorited).toBe(true);
    expect(listing?.favoritesCount).toBe(1);
  });
});
