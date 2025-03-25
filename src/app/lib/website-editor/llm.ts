import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAzure } from "@ai-sdk/azure";
import { createCohere } from "@ai-sdk/cohere";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "ai";
import { experimental_createProviderRegistry as createProviderRegistry } from "ai";
import { createAnthropicVertex } from "anthropic-vertex-ai";
import { GoogleAuth } from "google-auth-library";
import { createOllama } from "ollama-ai-provider";

import { env } from "../env/env";

const googleAuth = new GoogleAuth({
  scopes: "https://www.googleapis.com/auth/cloud-platform",
  credentials: {
    private_key: env.GOOGLE_CLIENT_SECRET,
    client_email: env.GOOGLE_CLIENT_EMAIL,
  },
});

const openai = createOpenAI({
  baseURL: env.OPENAI_API_URL,
  apiKey: env.OPENAI_API_KEY,
});

const azure = createAzure({
  resourceName: env.AZURE_RESOURCE_NAME,
  apiKey: env.AZURE_API_KEY,
});

const bedrock = createAmazonBedrock({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  sessionToken: env.AWS_SESSION_TOKEN,
});

const anthropic = createAnthropic({
  baseURL: env.ANTHROPIC_API_URL,
  apiKey: env.ANTHROPIC_API_KEY,
  headers: {
    "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
  },
});

const google = createGoogleGenerativeAI({
  baseURL: env.GOOGLE_GENERATIVE_AI_API_URL,
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const vertex = createVertex({
  project: env.GOOGLE_VERTEX_PROJECT,
  location: env.GOOGLE_VERTEX_LOCATION,
  googleAuthOptions: {
    credentials: {
      private_key: env.GOOGLE_CLIENT_SECRET,
      client_email: env.GOOGLE_CLIENT_EMAIL,
    },
  },
});

const mistral = createMistral({
  baseURL: env.MISTRAL_API_URL,
  apiKey: env.MISTRAL_API_KEY,
});

const codestral = createMistral({
  baseURL: env.CODESTRAL_API_URL,
  apiKey: env.CODESTRAL_API_KEY,
});

const cohere = createCohere({
  baseURL: env.COHERE_API_URL,
  apiKey: env.COHERE_API_KEY,
});

const groq = createOpenAI({
  baseURL: env.GROQ_API_URL,
  apiKey: env.GROQ_API_KEY,
});

const ollama = createOllama({
  baseURL: env.OLLAMA_API_URL,
});

const githubOpenAI = createOpenAI({
  baseURL: env.GITHUB_OPENAI_API_URL,
  apiKey: env.GITHUB_OPENAI_API_KEY,
});

const githubMistral = createMistral({
  baseURL: env.GITHUB_MISTRAL_API_URL,
  apiKey: env.GITHUB_MISTRAL_API_KEY,
});

const openRouter = createOpenAI({
  baseURL: env.OPENROUTER_API_URL,
  apiKey: env.OPENROUTER_API_KEY,
});

const together = createOpenAI({
  baseURL: env.TOGETHER_API_URL,
  apiKey: env.TOGETHER_API_KEY,
});

const glhf = createOpenAI({
  baseURL: env.GLHF_API_URL,
  apiKey: env.GLHF_API_KEY,
});

const anthropicVertex = createAnthropicVertex({
  // full documentation here: ✦ https://github.com/nalaso/anthropic-vertex-ai
  projectId: env.ANTHROPIC_VERTEX_PROJECT,
  region: env.ANTHROPIC_VERTEX_LOCATION,
  headers: {
    "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
  },
  googleAuth: googleAuth,
});

const modelRegistry = createProviderRegistry({
  anthropic: anthropic,
  anthropicVertex: anthropicVertex,
  openai: openai,
  azure: azure,
  bedrock: bedrock,
  google: google,
  vertex: vertex,
  mistral: mistral,
  codestral: codestral,
  githubOpenAI: githubOpenAI,
  githubMistral: githubMistral,
  openRouter: openRouter,
  together: together,
  cohere: cohere,
  groq: groq,
  glhf: glhf,
  ollama: ollama,
});

export const llm = (model: string): LanguageModelV1 =>
  modelRegistry.languageModel(model);
