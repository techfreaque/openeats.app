/* eslint-disable node/no-process-env */
import { z } from "zod";

import { validatedEnv } from "./env-util";

const isServer = typeof window === "undefined";
const isReactNative = !isServer && !window.document;
const isBrowser = !isServer && !!window.document;

export const platform = {
  isServer,
  isReactNative,
  isBrowser,
};

export const envSchema = z.object({
  platform: z.object({
    isServer: z.boolean(),
    isReactNative: z.boolean(),
    isBrowser: z.boolean(),
  }),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_NODE_ENV: z.string(),
  NEXT_PUBLIC_FRONTEND_APP_URL: z.string(),
  NEXT_PUBLIC_BACKEND_URL: z.string(),
  NEXT_PUBLIC_BACKEND_PROD: z.string(),
  NEXT_PUBLIC_BACKEND_DEV: z.string(),
  NEXT_PUBLIC_BACKEND_TEST: z.string(),
  NEXT_PUBLIC_GA_ID: z.string(),
});

export type EnvFrontend = z.infer<typeof envSchema>;

// Export validated environment for use throughout the application
export const envClient = validatedEnv<EnvFrontend>(
  {
    // explicitly use env variables so next.js can replace them
    NEXT_PUBLIC_APP_NAME: process.env["NEXT_PUBLIC_APP_NAME"]!,
    NEXT_PUBLIC_NODE_ENV: process.env["NEXT_PUBLIC_NODE_ENV"]!,
    NEXT_PUBLIC_FRONTEND_APP_URL: process.env["NEXT_PUBLIC_FRONTEND_APP_URL"]!,
    NEXT_PUBLIC_BACKEND_URL: process.env["NEXT_PUBLIC_BACKEND_URL"]!,
    NEXT_PUBLIC_BACKEND_PROD: process.env["NEXT_PUBLIC_BACKEND_PROD"]!,
    NEXT_PUBLIC_BACKEND_DEV: process.env["NEXT_PUBLIC_BACKEND_DEV"]!,
    NEXT_PUBLIC_BACKEND_TEST: process.env["NEXT_PUBLIC_BACKEND_TEST"]!,
    NEXT_PUBLIC_GA_ID: process.env["NEXT_PUBLIC_GA_ID"]!,
    platform,
  },
  envSchema,
);
