import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { prisma } from './utils/e2e-database';

describe('Soft delete (e2e)', () => {
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

  it('soft deletes a listing: stays in DB but disappears from public queries', async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const email = `soft-listing-${suffix}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email,
      password,
      firstName: 'Listing',
      lastName: 'Owner',
      phone: '11112222',
      accountType: 'basic',
    });

    const cookie = await login(email, password);

    const createRes = await authedPost('/listings', cookie, {
      description: 'Soft-delete listing test',
      price: 1500,
      location: 'UB',
      category: 'services',
    }).expect(201);
    const listingId = createRes.body.id as string;

    await authedDelete(`/listings/${listingId}`, cookie).expect(200);

    const inDb = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, deletedAt: true },
    });
    expect(inDb?.id).toBe(listingId);
    expect(inDb?.deletedAt).toBeTruthy();

    const publicList = await request(app.getHttpServer())
      .get('/listings')
      .expect(200);
    expect(
      publicList.body.items.some((item: { id: string }) => item.id === listingId),
    ).toBe(false);

    await request(app.getHttpServer()).get(`/listings/${listingId}`).expect(404);
  });

  it('restores a soft-deleted listing through admin endpoint', async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const ownerEmail = `restore-owner-${suffix}@example.com`;
    const adminEmail = `restore-admin-${suffix}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email: ownerEmail,
      password,
      firstName: 'Owner',
      lastName: 'User',
      phone: '22223333',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: adminEmail,
      password,
      firstName: 'Admin',
      lastName: 'User',
      phone: '33334444',
      accountType: 'basic',
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { isAdmin: true },
    });

    const ownerCookie = await login(ownerEmail, password);
    const adminCookie = await login(adminEmail, password);

    const createRes = await authedPost('/listings', ownerCookie, {
      description: 'Listing to restore',
      price: 1900,
      location: 'UB',
      category: 'services',
    }).expect(201);
    const listingId = createRes.body.id as string;

    await authedDelete(`/listings/${listingId}`, ownerCookie).expect(200);

    await authedPatch(`/admin/listings/${listingId}/restore`, adminCookie, {}).expect(
      200,
    );

    const inDb = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { deletedAt: true, status: true },
    });
    expect(inDb?.deletedAt).toBeNull();
    expect(inDb?.status).toBe('ACTIVE');

    const publicList = await request(app.getHttpServer())
      .get('/listings')
      .expect(200);
    expect(
      publicList.body.items.some((item: { id: string }) => item.id === listingId),
    ).toBe(true);
  });

  it('blocks login for soft-deleted users', async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const email = `deleted-login-${suffix}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email,
      password,
      firstName: 'Deleted',
      lastName: 'User',
      phone: '44445555',
      accountType: 'basic',
    });

    const cookie = await login(email, password);
    await authedDelete('/auth/me', cookie).expect(200);

    const loginAfterDelete = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(401);
    expect(loginAfterDelete.body.message).toBe('Бүртгэл устгагдсан байна');
  });

  it('allows admin to include deleted users/listings via includeDeleted=true', async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const ownerEmail = `admin-see-owner-${suffix}@example.com`;
    const deletedUserEmail = `admin-see-deleted-${suffix}@example.com`;
    const adminEmail = `admin-see-admin-${suffix}@example.com`;
    const password = 'password123';

    const ownerRes = await registerAndVerify({
      email: ownerEmail,
      password,
      firstName: 'Owner',
      lastName: 'User',
      phone: '55556666',
      accountType: 'basic',
    });

    const deletedUserRes = await registerAndVerify({
      email: deletedUserEmail,
      password,
      firstName: 'Deleted',
      lastName: 'User',
      phone: '66667777',
      accountType: 'basic',
    });

    await registerAndVerify({
      email: adminEmail,
      password,
      firstName: 'Admin',
      lastName: 'User',
      phone: '77778888',
      accountType: 'basic',
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { isAdmin: true },
    });

    const ownerCookie = await login(ownerEmail, password);
    const adminCookie = await login(adminEmail, password);

    const listingRes = await authedPost('/listings', ownerCookie, {
      description: 'Deleted listing visibility test',
      price: 2000,
      location: 'UB',
      category: 'services',
    }).expect(201);
    const listingId = listingRes.body.id as string;

    await authedDelete(`/listings/${listingId}`, ownerCookie).expect(200);

    await prisma.user.update({
      where: { id: deletedUserRes.body.id as string },
      data: { deletedAt: new Date() },
    });

    const usersDefault = await authedGet('/admin/users', adminCookie).expect(200);
    expect(
      usersDefault.body.items.some(
        (item: { id: string }) => item.id === (deletedUserRes.body.id as string),
      ),
    ).toBe(false);

    const usersWithDeleted = await authedGet(
      '/admin/users?includeDeleted=true',
      adminCookie,
    ).expect(200);
    expect(
      usersWithDeleted.body.items.some(
        (item: { id: string }) => item.id === (deletedUserRes.body.id as string),
      ),
    ).toBe(true);

    const listingsDefault = await authedGet('/admin/listings', adminCookie).expect(
      200,
    );
    expect(
      listingsDefault.body.items.some((item: { id: string }) => item.id === listingId),
    ).toBe(false);

    const listingsWithDeleted = await authedGet(
      '/admin/listings?includeDeleted=true',
      adminCookie,
    ).expect(200);
    expect(
      listingsWithDeleted.body.items.some((item: { id: string }) => item.id === listingId),
    ).toBe(true);

    expect(ownerRes.body.id).toBeTruthy();
  });
});
