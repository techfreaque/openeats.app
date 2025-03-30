import { envSchema as portalEnvSchema } from "next-vibe/server/env";
import { validateEnv } from "next-vibe/shared/utils/env-util";
import { z } from "zod";

export const envSchema = portalEnvSchema.extend({
  SUPPORT_EMAIL: z.string().email(),
  DATABASE_URL: z.string(),
  TEST_SERVER_URL: z.string(),
  GOOGLE_MAPS_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(),
  OPENAI_API_URL: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_EMAIL: z.string(),
  AZURE_RESOURCE_NAME: z.string(),
  AZURE_API_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SESSION_TOKEN: z.string(),
  ANTHROPIC_API_URL: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  GOOGLE_GENERATIVE_AI_API_URL: z.string(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  GOOGLE_VERTEX_PROJECT: z.string(),
  GOOGLE_VERTEX_LOCATION: z.string(),
  MISTRAL_API_URL: z.string(),
  MISTRAL_API_KEY: z.string(),
  CODESTRAL_API_URL: z.string(),
  CODESTRAL_API_KEY: z.string(),
  COHERE_API_URL: z.string(),
  COHERE_API_KEY: z.string(),
  GROQ_API_URL: z.string(),
  GROQ_API_KEY: z.string(),
  OLLAMA_API_URL: z.string(),
  GITHUB_OPENAI_API_URL: z.string(),
  GITHUB_OPENAI_API_KEY: z.string(),
  GITHUB_MISTRAL_API_URL: z.string(),
  GITHUB_MISTRAL_API_KEY: z.string(),
  OPENROUTER_API_URL: z.string(),
  OPENROUTER_API_KEY: z.string(),
  TOGETHER_API_URL: z.string(),
  TOGETHER_API_KEY: z.string(),
  GLHF_API_URL: z.string(),
  GLHF_API_KEY: z.string(),
  ANTHROPIC_VERTEX_PROJECT: z.string(),
  ANTHROPIC_VERTEX_LOCATION: z.string(),
});

export type Env = z.infer<typeof envSchema>;
type EnvInput = z.input<typeof envSchema>;

// Export validated environment for use throughout the application
export const env: Env = validateEnv(
  // eslint-disable-next-line node/no-process-env
  process.env as unknown as EnvInput,
  envSchema,
);
