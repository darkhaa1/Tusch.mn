import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/modules/firebase/firebase.service';
import { prisma } from './utils/e2e-database';

type DecodedStub = { uid: string; phone_number: string } | null;

class FakeFirebaseService {
  enabled = true;
  decoded: DecodedStub = null;

  isEnabled() {
    return this.enabled;
  }
  async verifyIdToken() {
    return this.decoded;
  }
  async getUserByPhone() {
    return null;
  }
  async deleteFirebaseUser() {
    return;
  }
}

describe('GET /users/me/auth-methods (e2e)', () => {
  let app: INestApplication;
  let firebase: FakeFirebaseService;

  beforeAll(async () => {
    firebase = new FakeFirebaseService();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseService)
      .useValue(firebase)
      .compile();

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

  beforeEach(() => {
    firebase.enabled = true;
    firebase.decoded = null;
  });

  async function registerEmailUser(suffix: string) {
    const stamp = Date.now();
    const email = `auth-methods-${suffix}-${stamp}@example.com`;
    const password = 'password123';
    // Phone is required at registration but we null it immediately —
    // the suite tests email-only and phone-only shapes independently and
    // would collide on the UNIQUE constraint if we reused a literal.
    const seedPhone = `8${String(stamp).slice(-7)}`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        firstName: 'Auth',
        lastName: 'Methods',
        phone: seedPhone,
        accountType: 'basic',
        acceptedTerms: true,
      })
      .expect(201);

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, phone: null },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const cookie = (loginRes.headers['set-cookie'] as unknown as string[])?.[0]
      ?.split(';')[0];

    return { email, cookie };
  }

  it('rejects unauthenticated callers with 401', async () => {
    const res = await request(app.getHttpServer()).get(
      '/users/me/auth-methods',
    );
    expect(res.status).toBe(401);
  });

  it('returns email + hasPassword for an email-only user, canUnlink false', async () => {
    const { email, cookie } = await registerEmailUser('email-only');

    const res = await request(app.getHttpServer())
      .get('/users/me/auth-methods')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toEqual({
      email: { value: email, verified: true },
      phone: null,
      hasPassword: true,
      canUnlinkEmail: false, // would leave the account with no login method
      canUnlinkPhone: false, // no phone to unlink
    });
  });

  it('returns both factors with canUnlink true once a phone is linked', async () => {
    const { email, cookie } = await registerEmailUser('with-phone');

    firebase.decoded = { uid: 'fb_uid_methods', phone_number: '+97699112277' };
    await request(app.getHttpServer())
      .post('/auth/phone/link')
      .set('Cookie', cookie)
      .send({ idToken: 'fake-token', phone: '+97699112277' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/users/me/auth-methods')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body).toEqual({
      email: { value: email, verified: true },
      phone: { value: '+97699112277', verified: true },
      hasPassword: true,
      canUnlinkEmail: true,
      canUnlinkPhone: true,
    });
  });

  it('reports canUnlinkPhone=false on a phone-only account', async () => {
    firebase.decoded = { uid: 'fb_uid_phone_only', phone_number: '+97699112278' };
    const login = await request(app.getHttpServer())
      .post('/auth/phone/login')
      .send({ idToken: 'fake-token', phone: '+97699112278' })
      .expect(201);

    const cookie = (login.headers['set-cookie'] as unknown as string[])?.[0]
      ?.split(';')[0];

    const res = await request(app.getHttpServer())
      .get('/users/me/auth-methods')
      .set('Cookie', cookie)
      .expect(200);

    expect(res.body.phone).toEqual({
      value: '+97699112278',
      verified: true,
    });
    expect(res.body.email).toBeNull();
    expect(res.body.hasPassword).toBe(false);
    expect(res.body.canUnlinkPhone).toBe(false);
  });
});
