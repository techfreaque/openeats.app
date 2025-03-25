import { z } from "zod";

export const envSchema = z.object({
  EXPO_PUBLIC_FRONTEND_APP_URL: z.string(),
  EXPO_PUBLIC_BACKEND_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  return envSchema.parse(process.env);
};

// Export validated environment for use throughout the application
export const env = validateEnv();
