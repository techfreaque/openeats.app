import type { z } from "zod";

import { validateData } from "./validation";

export function validatedEnv<TSchema extends z.ZodType>(
  env: z.input<TSchema>,
  envSchema: TSchema,
): z.infer<TSchema> {
  const { data, success, message } = validateData<TSchema>(env, envSchema);
  if (!success) {
    throw new Error(`Environment validation error: ${message}`);
  }
  return data;
}
