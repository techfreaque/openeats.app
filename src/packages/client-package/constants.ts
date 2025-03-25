import { APP_DOMAIN } from "@/next-portal/constants";

export const backendPages = {
  home: "/",
  login: "/v1/auth/public/login",
  register: "/v1/auth/public/signup",
  notFound: "/404",
  apiDocs: "/v1/api-docs",
};

export const frontendRoutes = {
  home: `${APP_DOMAIN}/`,
  login: `${APP_DOMAIN}/login`,
  help: `${APP_DOMAIN}/help`,
  register: `${APP_DOMAIN}/register`,
  forgotPassword: `${APP_DOMAIN}/forgot-password`,
  resetPassword: `${APP_DOMAIN}/reset-password`,
  account: `${APP_DOMAIN}/account`,
  notFound: `${APP_DOMAIN}/404`,
} as const;
