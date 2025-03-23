import { z } from "zod";

import { envClientBaseSchema } from "../client/env-client";
import { validatedEnv } from "../shared/utils/env-util";

export const envSchema = envClientBaseSchema.extend({
  JWT_SECRET_KEY: z.string(),
  SUPPORT_EMAIL: z.string().email(),
  EMAIL_FROM_EMAIL: z.string().email(),
  EMAIL_FROM_NAME: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string().transform((val: string): number => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error("The env EMAIL_PORT must be a number");
    }
    return parsed;
  }),
  EMAIL_SECURE: z.string().transform((val: string): boolean => {
    if (val === "true") {
      return true;
    }
    if (val === "false") {
      return false;
    }
    throw new Error("The env EMAIL_SECURE must be a boolean");
  }),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
});

export type Env = z.infer<typeof envSchema>;
type EnvInput = z.input<typeof envSchema>;

// Export validated environment for use throughout the application

export const env: Env = validatedEnv(
  // eslint-disable-next-line node/no-process-env
  process.env as unknown as EnvInput,
  envSchema,
);
