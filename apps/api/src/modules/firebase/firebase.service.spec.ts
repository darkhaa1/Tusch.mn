import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';

function buildService(env: Record<string, string | undefined>): FirebaseService {
  const config = {
    get: <T>(key: string): T | undefined => env[key] as T | undefined,
  } as ConfigService;
  const service = new FirebaseService(config);
  service.onModuleInit();
  return service;
}

describe('FirebaseService', () => {
  it('is exported by the Nest DI container', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: { get: () => undefined } as unknown as ConfigService,
        },
      ],
    }).compile();
    expect(moduleRef.get(FirebaseService)).toBeInstanceOf(FirebaseService);
  });

  describe('isEnabled', () => {
    it('returns false when all three vars are absent', () => {
      const service = buildService({});
      expect(service.isEnabled()).toBe(false);
    });

    it('returns false when only PROJECT_ID is set', () => {
      const service = buildService({ FIREBASE_PROJECT_ID: 'proj' });
      expect(service.isEnabled()).toBe(false);
    });

    it('returns false when only CLIENT_EMAIL is set', () => {
      const service = buildService({
        FIREBASE_CLIENT_EMAIL: 'sa@example.iam.gserviceaccount.com',
      });
      expect(service.isEnabled()).toBe(false);
    });

    it('returns false when only PRIVATE_KEY is set', () => {
      const service = buildService({ FIREBASE_PRIVATE_KEY: 'key' });
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('graceful no-op when disabled', () => {
    let service: FirebaseService;

    beforeEach(() => {
      service = buildService({});
    });

    it('verifyIdToken resolves null', async () => {
      await expect(service.verifyIdToken('whatever')).resolves.toBeNull();
    });

    it('getUserByPhone resolves null', async () => {
      await expect(
        service.getUserByPhone('+97699112233'),
      ).resolves.toBeNull();
    });

    it('deleteFirebaseUser resolves without throwing', async () => {
      await expect(
        service.deleteFirebaseUser('uid'),
      ).resolves.toBeUndefined();
    });
  });
});
