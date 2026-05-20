import { validateEnv } from './env.schema';

const validEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
  JWT_SECRET: 'a-very-long-secret-that-is-at-least-16-chars',
  CORS_ORIGIN: 'http://localhost:3000',
} as NodeJS.ProcessEnv;

function without(env: NodeJS.ProcessEnv, key: string): NodeJS.ProcessEnv {
  const copy = { ...env } as Record<string, string>;
  delete copy[key];
  return copy as NodeJS.ProcessEnv;
}

describe('validateEnv', () => {
  it('validates a correct environment', () => {
    expect(() => validateEnv(validEnv)).not.toThrow();
  });

  it('applies default values', () => {
    const result = validateEnv(validEnv);
    expect(result.PORT).toBe(3310);
    expect(result.JWT_EXPIRES_IN).toBe('7d');
    expect(result.NODE_ENV).toBe('test');
  });

  it('fails if DATABASE_URL is missing', () => {
    expect(() => validateEnv(without(validEnv, 'DATABASE_URL'))).toThrow('DATABASE_URL');
  });

  it('fails if JWT_SECRET is missing', () => {
    expect(() => validateEnv(without(validEnv, 'JWT_SECRET'))).toThrow('JWT_SECRET');
  });

  it('fails if JWT_SECRET is too short', () => {
    expect(() =>
      validateEnv({ ...validEnv, JWT_SECRET: 'tooshort' }),
    ).toThrow('JWT_SECRET');
  });

  it('fails if CORS_ORIGIN is missing', () => {
    expect(() => validateEnv(without(validEnv, 'CORS_ORIGIN'))).toThrow('CORS_ORIGIN');
  });

  it('fails if DATABASE_URL is not a valid URL', () => {
    expect(() =>
      validateEnv({ ...validEnv, DATABASE_URL: 'not-a-url' }),
    ).toThrow('DATABASE_URL');
  });

  describe('Firebase Admin vars', () => {
    it('allows all three to be absent (phone auth disabled)', () => {
      expect(() => validateEnv(validEnv)).not.toThrow();
    });

    it('accepts all three together', () => {
      expect(() =>
        validateEnv({
          ...validEnv,
          FIREBASE_PROJECT_ID: 'proj',
          FIREBASE_CLIENT_EMAIL: 'sa@proj.iam.gserviceaccount.com',
          FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----',
        }),
      ).not.toThrow();
    });

    it('fails if FIREBASE_PROJECT_ID is set without the other two', () => {
      expect(() =>
        validateEnv({ ...validEnv, FIREBASE_PROJECT_ID: 'proj' }),
      ).toThrow(/FIREBASE_CLIENT_EMAIL|FIREBASE_PRIVATE_KEY/);
    });

    it('fails if FIREBASE_CLIENT_EMAIL is set without the other two', () => {
      expect(() =>
        validateEnv({
          ...validEnv,
          FIREBASE_CLIENT_EMAIL: 'sa@proj.iam.gserviceaccount.com',
        }),
      ).toThrow(/FIREBASE_PROJECT_ID|FIREBASE_PRIVATE_KEY/);
    });

    it('fails if FIREBASE_PRIVATE_KEY is set without the other two', () => {
      expect(() =>
        validateEnv({ ...validEnv, FIREBASE_PRIVATE_KEY: 'key' }),
      ).toThrow(/FIREBASE_PROJECT_ID|FIREBASE_CLIENT_EMAIL/);
    });
  });
});
