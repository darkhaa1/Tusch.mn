import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { prisma } from './utils/e2e-database';
import { createTestApp } from './utils/create-test-app';

const ONE_BY_ONE_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64',
);

describe('Listing image reorder (e2e)', () => {
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

  const uploadThreeImages = async (listingId: string, cookie: string) => {
    return request(app.getHttpServer())
      .post(`/listings/${listingId}/images`)
      .set('Cookie', cookie)
      .attach('files', ONE_BY_ONE_GIF, {
        filename: 'first.gif',
        contentType: 'image/gif',
      })
      .attach('files', ONE_BY_ONE_GIF, {
        filename: 'second.gif',
        contentType: 'image/gif',
      })
      .attach('files', ONE_BY_ONE_GIF, {
        filename: 'third.gif',
        contentType: 'image/gif',
      })
      .expect(201);
  };

  const setupListing = async () => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const email = `reorder-owner-${suffix}@example.com`;
    const password = 'password123';

    await registerAndVerify({
      email,
      password,
      firstName: 'Owner',
      lastName: 'User',
      phone: '11111111',
      accountType: 'basic',
    });

    const cookie = await login(email, password);

    const listingRes = await authedPost('/listings', cookie, {
      description: `Listing for reorder ${suffix}`,
      price: 1000,
      location: 'UB',
      category: 'tutoring',
    }).expect(201);

    return {
      cookie,
      listingId: listingRes.body.id as string,
    };
  };

  it('uploads 3 images, reorders them, and updates positions', async () => {
    const ctx = await setupListing();
    const uploadRes = await uploadThreeImages(ctx.listingId, ctx.cookie);
    const originalIds = (uploadRes.body.images as Array<{ id: string }>).map(
      (image) => image.id,
    );
    expect(originalIds).toHaveLength(3);

    const reorderedIds = [...originalIds].reverse();
    const reorderRes = await authedPatch(
      `/listings/${ctx.listingId}/images/reorder`,
      ctx.cookie,
      { imageIds: reorderedIds },
    ).expect(200);

    const reorderedImages = reorderRes.body.images as Array<{
      id: string;
      position: number;
    }>;
    expect(reorderedImages.map((image) => image.id)).toEqual(reorderedIds);
    expect(reorderedImages.map((image) => image.position)).toEqual([0, 1, 2]);

    const dbImages = await prisma.listingImage.findMany({
      where: { listingId: ctx.listingId },
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    });
    expect(dbImages.map((image) => image.id)).toEqual(reorderedIds);
    expect(dbImages.map((image) => image.position)).toEqual([0, 1, 2]);
  });

  it('returns 400 when reorder imageIds are invalid for the listing', async () => {
    const ctx = await setupListing();
    const uploadRes = await uploadThreeImages(ctx.listingId, ctx.cookie);
    const imageIds = (uploadRes.body.images as Array<{ id: string }>).map(
      (image) => image.id,
    );
    expect(imageIds).toHaveLength(3);

    await authedPatch(`/listings/${ctx.listingId}/images/reorder`, ctx.cookie, {
      imageIds: [imageIds[0], imageIds[1], 'not-from-this-listing'],
    }).expect(400);
  });
});
