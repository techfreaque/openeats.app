import { envClient } from "./env/env-client";

export const APP_NAME = envClient.NEXT_PUBLIC_APP_NAME;
export const APP_DOMAIN = envClient.NEXT_PUBLIC_FRONTEND_APP_URL;

export const ENDPOINT_DOMAINS = {
  prod: envClient.NEXT_PUBLIC_BACKEND_PROD,
  dev: envClient.NEXT_PUBLIC_BACKEND_DEV,
  test: envClient.NEXT_PUBLIC_BACKEND_TEST,
};
