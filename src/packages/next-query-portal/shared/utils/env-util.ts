import type { z } from "zod";

import { validateData } from "./validation";

export function validateEnv<TSchema extends z.ZodType>(
  env: z.input<TSchema> | typeof process.env,
  envSchema: TSchema,
): z.TypeOf<TSchema> {
  const { data, success, message } = validateData<TSchema>(
    env as z.input<TSchema>,
    envSchema,
  );
  if (!success) {
    throw new Error(`Environment validation error: ${message}`);
  }
  return data;
}
