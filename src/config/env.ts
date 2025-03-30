import { envSchema as portalEnvSchema } from "next-vibe/server/env";
import { validateEnv } from "next-vibe/shared/utils/env-util";
import { z } from "zod";

export const envSchema = portalEnvSchema.extend({
  SUPPORT_EMAIL: z.string().email(),
  DATABASE_URL: z.string(),
  TEST_SERVER_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;
type EnvInput = z.input<typeof envSchema>;

// Export validated environment for use throughout the application
export const env: Env = validateEnv(
  // eslint-disable-next-line node/no-process-env
  process.env as unknown as EnvInput,
  envSchema,
);
