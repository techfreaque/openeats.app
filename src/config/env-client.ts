/* eslint-disable node/no-process-env */
import { envClientSchema as portalEnvClientSchema } from "next-vibe/client/env-client";
import { validateEnv } from "next-vibe/shared/utils/env-util";
import { z } from "zod";

const isServer = typeof window === "undefined";
const isReactNative = !isServer && !window.document;
const isBrowser = !isServer && !!window.document;

export const platform = {
  isServer,
  isReactNative,
  isBrowser,
};

export const envClientSchema = portalEnvClientSchema.extend({
  NEXT_PUBLIC_GA_ID: z.string().min(1),
});

export type EnvFrontend = z.infer<typeof envClientSchema>;
export type EnvFrontendInput = z.input<typeof envClientSchema>;

// Export validated environment for use throughout the application
export const envClient: EnvFrontend = validateEnv(
  {
    // explicitly use env variables so next.js can replace them
    NEXT_PUBLIC_GA_ID: process.env["NEXT_PUBLIC_GA_ID"],
    NEXT_PUBLIC_APP_NAME: process.env["NEXT_PUBLIC_APP_NAME"],
    NODE_ENV: process.env["NODE_ENV"],
    NEXT_PUBLIC_FRONTEND_APP_URL: process.env["NEXT_PUBLIC_FRONTEND_APP_URL"],
    NEXT_PUBLIC_BACKEND_URL: process.env["NEXT_PUBLIC_BACKEND_URL"],
    NEXT_PUBLIC_BACKEND_PROD: process.env["NEXT_PUBLIC_BACKEND_PROD"],
    NEXT_PUBLIC_BACKEND_DEV: process.env["NEXT_PUBLIC_BACKEND_DEV"],
    NEXT_PUBLIC_BACKEND_TEST: process.env["NEXT_PUBLIC_BACKEND_TEST"],
    platform,
  } as EnvFrontendInput,
  envClientSchema,
);
