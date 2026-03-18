import { z } from 'zod';

const envSchema = z.object({
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

  // Cookie domain (optional — used in Set-Cookie header)
  COOKIE_DOMAIN: z.string().optional(),
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
