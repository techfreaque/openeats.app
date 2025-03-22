import { z } from "zod";

import { validatedEnv } from "./env-util";

export const envSchema = z.object({
  NODE_ENV: z.string(),
  JWT_SECRET_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

// Export validated environment for use throughout the application
// eslint-disable-next-line node/no-process-env
export const env = validatedEnv<Env>(process.env as Env, envSchema);
