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

describe('Phone auth (e2e)', () => {
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

  const phoneLogin = (body: { idToken: string; phone: string }) =>
    request(app.getHttpServer()).post('/auth/phone/login').send(body);

  it('creates a new user on first phone login', async () => {
    firebase.decoded = { uid: 'fb_uid_1', phone_number: '+97699112201' };

    const res = await phoneLogin({
      idToken: 'fake-token',
      phone: '+97699112201',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.phone).toBe('+97699112201');
    expect(res.body.user.phoneVerified).toBe(true);
    // firebaseUid must never leak to the API consumer.
    expect(res.body.user.firebaseUid).toBeUndefined();

    const dbUser = await prisma.user.findUnique({
      where: { phone: '+97699112201' },
    });
    expect(dbUser?.firebaseUid).toBe('fb_uid_1');
    expect(dbUser?.phoneVerified).toBe(true);
  });

  it('returns the same user on a second login with the same firebaseUid', async () => {
    firebase.decoded = { uid: 'fb_uid_2', phone_number: '+97699112202' };

    const first = await phoneLogin({
      idToken: 'fake-token',
      phone: '+97699112202',
    });
    expect(first.status).toBe(201);
    const firstId = first.body.user.id;

    const second = await phoneLogin({
      idToken: 'fake-token-2',
      phone: '99112202', // free-form input, server normalizes to E.164
    });
    expect(second.status).toBe(201);
    expect(second.body.user.id).toBe(firstId);

    const count = await prisma.user.count({
      where: { phone: '+97699112202' },
    });
    expect(count).toBe(1);
  });

  it('rejects an invalid Firebase ID token with 401', async () => {
    firebase.decoded = null;

    const res = await phoneLogin({
      idToken: 'bad-token',
      phone: '+97699112203',
    });
    expect(res.status).toBe(401);
  });

  it('rejects a non-Mongolian phone with 400', async () => {
    firebase.decoded = { uid: 'fb_uid_us', phone_number: '+15551234567' };

    const res = await phoneLogin({
      idToken: 'fake-token',
      phone: '+15551234567',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a phone that does not match the Firebase token with 400', async () => {
    firebase.decoded = { uid: 'fb_uid_mismatch', phone_number: '+97699112299' };

    const res = await phoneLogin({
      idToken: 'fake-token',
      phone: '+97699112204',
    });
    expect(res.status).toBe(400);
  });

  it('returns 503 when Firebase is not configured', async () => {
    firebase.enabled = false;

    const res = await phoneLogin({
      idToken: 'fake-token',
      phone: '+97699112205',
    });
    expect(res.status).toBe(503);
  });

  it('rejects /auth/phone/link without a session with 401', async () => {
    firebase.decoded = { uid: 'fb_uid_anon', phone_number: '+97699112206' };

    const res = await request(app.getHttpServer())
      .post('/auth/phone/link')
      .send({ idToken: 'fake-token', phone: '+97699112206' });
    expect(res.status).toBe(401);
  });

  it('returns 409 when linking a phone already attached to another user', async () => {
    // ── seed user A with phone +97699112207 via phone login ──────────────
    firebase.decoded = { uid: 'fb_uid_owner', phone_number: '+97699112207' };
    const owner = await phoneLogin({
      idToken: 'fake-token',
      phone: '+97699112207',
    });
    expect(owner.status).toBe(201);

    // ── seed user B via classic email/password register ──────────────────
    const email = `linker-${Date.now()}@example.com`;
    const password = 'password123';
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        firstName: 'Linker',
        lastName: 'User',
        phone: '+97699199999',
        accountType: 'basic',
        acceptedTerms: true,
      })
      .expect(201);

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true, phone: null }, // free the phone slot first
    });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const cookie = (loginRes.headers['set-cookie'] as unknown as string[])?.[0]?.split(
      ';',
    )[0];

    // ── user B tries to link the phone already owned by user A ───────────
    firebase.decoded = { uid: 'fb_uid_b', phone_number: '+97699112207' };
    const res = await request(app.getHttpServer())
      .post('/auth/phone/link')
      .set('Cookie', cookie)
      .send({ idToken: 'fake-token', phone: '+97699112207' });
    expect(res.status).toBe(409);
  });

  it('refuses /auth/phone/unlink on a phone-only account with 400', async () => {
    firebase.decoded = { uid: 'fb_uid_only', phone_number: '+97699112208' };
    const login = await phoneLogin({
      idToken: 'fake-token',
      phone: '+97699112208',
    });
    expect(login.status).toBe(201);

    const cookie = (login.headers['set-cookie'] as unknown as string[])?.[0]?.split(
      ';',
    )[0];

    const res = await request(app.getHttpServer())
      .post('/auth/phone/unlink')
      .set('Cookie', cookie)
      .send({});
    expect(res.status).toBe(400);

    const stillThere = await prisma.user.findUnique({
      where: { phone: '+97699112208' },
    });
    expect(stillThere).not.toBeNull();
  });
});
