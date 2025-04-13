import { stringToIntSchema } from "next-vibe/shared";
import { z } from "zod";

import { envClientBaseSchema } from "../client/env-client";
import { validateEnv } from "../shared/utils/env-util";
import { AwsSnsAwsRegions } from "./sms/providers/aws-sns";
import { SmsProviders } from "./sms/utils";

export const envSchema = envClientBaseSchema.extend({
  JWT_SECRET_KEY: z.string(),
  SUPPORT_EMAIL: z.string().email(),
  EMAIL_FROM_EMAIL: z.string().email(),
  EMAIL_FROM_NAME: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: stringToIntSchema("The env EMAIL_PORT must be a number"),
  EMAIL_SECURE: z.string().transform((val: string): boolean => {
    if (val === "true") {
      return true;
    }
    if (val === "false") {
      return false;
    }
    throw new Error("The env EMAIL_SECURE must be a boolean");
  }),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),

  // SMS environment variables
  // TODO validate based on provider
  SMS_PROVIDER: z.nativeEnum(SmsProviders),
  SMS_FROM_NUMBER: z.string(),
  SMS_MAX_LENGTH: z.string().optional(),
  SMS_MAX_RETRY_ATTEMPTS: z.string().optional(),
  SMS_RETRY_DELAY_MS: z.string().optional(),

  // MessageBird provider
  MESSAGEBIRD_ACCESS_KEY: z.string().optional(),

  // Twilio provider
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_REGION: z.string().optional(),

  // AWS SNS provider
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.nativeEnum(AwsSnsAwsRegions).optional(),

  // HTTP provider
  SMS_HTTP_API_URL: z.string().optional(),
  SMS_HTTP_API_KEY: z.string().optional(),
  SMS_HTTP_API_METHOD: z.string().optional(),
  SMS_HTTP_PHONE_REGEX: z.string().optional(),
  SMS_HTTP_TO_FIELD: z.string().optional(),
  SMS_HTTP_MESSAGE_FIELD: z.string().optional(),
  SMS_HTTP_FROM_FIELD: z.string().optional(),
  SMS_HTTP_RESPONSE_ID_FIELD: z.string().optional(),
  SMS_HTTP_CUSTOM_HEADERS: z.string().optional(),
  SMS_HTTP_AUTH_SCHEME: z.string().optional(),
  SMS_HTTP_CONTENT_TYPE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Export validated environment for use throughout the application
// eslint-disable-next-line node/no-process-env
export const env: Env = validateEnv(process.env, envSchema);
