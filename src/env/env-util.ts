import type { z } from "zod";

import { validateData } from "../shared/utils/validation";

export function validatedEnv<T>(env: T, envSchema: z.ZodSchema<T>): T {
  const { data, success, message } = validateData<T>(env, envSchema);
  if (!success) {
    throw new Error(`Environment validation error: ${message}`);
  }
  return data;
}
