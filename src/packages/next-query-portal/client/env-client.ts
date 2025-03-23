/* eslint-disable node/no-process-env */
import { z } from "zod";

import { validatedEnv } from "../shared/utils/env-util";

const isServer = typeof window === "undefined";
const isReactNative = !isServer && !window.document;
const isBrowser = !isServer && !!window.document;

const platform = {
  isServer,
  isReactNative,
  isBrowser,
};

export const envClientBaseSchema = z.object({
  NODE_ENV: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_FRONTEND_APP_URL: z.string(),
  NEXT_PUBLIC_BACKEND_URL: z.string(),
  NEXT_PUBLIC_BACKEND_PROD: z.string(),
  NEXT_PUBLIC_BACKEND_DEV: z.string(),
  NEXT_PUBLIC_BACKEND_TEST: z.string(),
});

export const envClientSchema = envClientBaseSchema.extend({
  platform: z.object({
    isServer: z.boolean(),
    isReactNative: z.boolean(),
    isBrowser: z.boolean(),
  }),
});

export type EnvFrontend = z.infer<typeof envClientSchema>;

// Export validated environment for use throughout the application
export const envClient: EnvFrontend = validatedEnv(
  {
    // explicitly use env variables so next.js can replace them
    NEXT_PUBLIC_APP_NAME: process.env["NEXT_PUBLIC_APP_NAME"]!,
    NODE_ENV: process.env["NODE_ENV"],
    NEXT_PUBLIC_FRONTEND_APP_URL: process.env["NEXT_PUBLIC_FRONTEND_APP_URL"]!,
    NEXT_PUBLIC_BACKEND_URL: process.env["NEXT_PUBLIC_BACKEND_URL"]!,
    NEXT_PUBLIC_BACKEND_PROD: process.env["NEXT_PUBLIC_BACKEND_PROD"]!,
    NEXT_PUBLIC_BACKEND_DEV: process.env["NEXT_PUBLIC_BACKEND_DEV"]!,
    NEXT_PUBLIC_BACKEND_TEST: process.env["NEXT_PUBLIC_BACKEND_TEST"]!,
    platform,
  },
  envClientSchema,
);
