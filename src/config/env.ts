import { envSchema as portalEnvSchema } from "next-query-portal/server/env";
import { validatedEnv } from "next-query-portal/shared/utils/env-util";
import { z } from "zod";

export const envSchema = portalEnvSchema.extend({
  SUPPORT_EMAIL: z.string().email(),
  DATABASE_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;
type EnvInput = z.input<typeof envSchema>;

// Export validated environment for use throughout the application
export const env: Env = validatedEnv(
  // eslint-disable-next-line node/no-process-env
  process.env as unknown as EnvInput,
  envSchema,
);
