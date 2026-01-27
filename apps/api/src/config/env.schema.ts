import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (env: NodeJS.ProcessEnv): Env => {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => issue.message)
      .join(', ');
    throw new Error(`Invalid environment variables: ${details}`);
  }
  return result.data;
};
