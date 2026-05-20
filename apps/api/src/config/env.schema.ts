import { z } from 'zod';

const envSchema = z
  .object({
    // App
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3310),

    // Database
    DATABASE_URL: z
      .string({ required_error: 'DATABASE_URL is required' })
      .url('DATABASE_URL must be a valid URL'),

    // Auth / JWT
    JWT_SECRET: z
      .string({ required_error: 'JWT_SECRET is required' })
      .min(16, 'JWT_SECRET must be at least 16 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // CORS
    CORS_ORIGIN: z
      .string({ required_error: 'CORS_ORIGIN is required' }),

    // Public URL of the web app — used to build links in transactional
    // emails (verify-email, password-reset, etc.). Defaults to the local
    // dev origin when omitted.
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    // Cookie domain (optional — used in Set-Cookie header)
    COOKIE_DOMAIN: z.string().optional(),

    // Firebase Admin (phone auth). All three are individually optional, but
    // if any is set, all three must be set. Absence disables phone auth.
    FIREBASE_PROJECT_ID: z.string().min(1).optional(),
    FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),

    // Resend (transactional email). Setting RESEND_API_KEY turns on the
    // EmailService; RESEND_FROM_EMAIL becomes required in that case so we
    // never accidentally send from an unverified address. RESEND_FROM_NAME
    // is purely cosmetic ("Tusch" by default).
    RESEND_API_KEY: z
      .string()
      .regex(/^re_/, 'RESEND_API_KEY must start with "re_"')
      .optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    RESEND_FROM_NAME: z.string().min(1).default('Tusch'),
  })
  .superRefine((env, ctx) => {
    const firebaseVars = [
      ['FIREBASE_PROJECT_ID', env.FIREBASE_PROJECT_ID],
      ['FIREBASE_CLIENT_EMAIL', env.FIREBASE_CLIENT_EMAIL],
      ['FIREBASE_PRIVATE_KEY', env.FIREBASE_PRIVATE_KEY],
    ] as const;
    const anySet = firebaseVars.some(([, v]) => !!v);
    if (anySet) {
      for (const [name, value] of firebaseVars) {
        if (!value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [name],
            message: `${name} is required when other FIREBASE_* variables are set`,
          });
        }
      }
    }

    if (env.RESEND_API_KEY && !env.RESEND_FROM_EMAIL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['RESEND_FROM_EMAIL'],
        message:
          'RESEND_FROM_EMAIL is required when RESEND_API_KEY is set',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (env: NodeJS.ProcessEnv): Env => {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `\n❌ Config validation error — missing or invalid environment variables:\n${details}\n\n👉 Check your .env file against apps/api/.env.example\n`,
    );
  }
  return result.data;
};
