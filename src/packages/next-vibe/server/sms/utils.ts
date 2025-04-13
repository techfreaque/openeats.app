import { errorLogger, type ResponseType } from "next-vibe/shared";
import { z } from "zod";

import type { JwtPayloadType } from "../endpoints/auth/jwt";
import { env } from "../env";

/**
 * SendSmsParams defines the parameters needed to send an SMS
 */
export interface SendSmsParams {
  to: string;
  message: string;
  from?: string;
  /**
   * Optional provider-specific options
   */
  options?: ProviderBaseOptions;
  /**
   * Retry configuration
   */
  retry?: {
    attempts?: number;
    delayMs?: number;
  };
}

export interface ProviderBaseOptions {
  provider?: SmsProviders;
  // These are common options that might be used across providers
  type?: string;
  datacoding?: string;
  reference?: string;
  validity?: number | string;
  gateway?: number | string;
  smsType?: string;
  headers?: HeadersOptions;
  extraFields?: ExtraFieldsOptions;
  attributes?: AttributesOptions;
  [key: string]: unknown; // Allow extension for provider-specific options
}

// Type-safe options objects
export interface HeadersOptions {
  [key: string]: string;
}

export interface ExtraFieldsOptions {
  [key: string]: string | number | boolean;
}

export interface AttributesOptions {
  [key: string]: string | number | boolean;
}

/**
 * Strongly typed metadata interface for SMS results
 */
export interface SmsResultMetadata {
  // Common metadata fields used by various providers
  direction?: string;
  uri?: string;
  accountSid?: string;
  reference?: string;
  createdDatetime?: string;
  recipient?: string;
  gateway?: string | number;
  requestId?: string;
  region?: string;
  responseStatus?: number;
  responseData?: SmsResponseData;
  // Allow provider-specific fields with typed convention
  [key: string]: unknown;
}

/**
 * Type for response data that can be nested
 */
export interface SmsResponseData {
  [key: string]: string | number | boolean | null | SmsResponseData;
}

/**
 * Result information from sending an SMS
 */
export interface SmsResult {
  messageId: string;
  provider: SmsProviders;
  timestamp: string;
  to: string;
  cost?: {
    amount?: number;
    currency?: string;
  };
  segments?: number;
  status?: string;
  metadata?: SmsResultMetadata;
}

/**
 * Provider interface for SMS services
 */
export interface SmsProvider {
  name: SmsProviders;
  sendSms(params: SendSmsParams): Promise<ResponseType<SmsResult>>;
  validatePhoneNumber?(phoneNumber: string): {
    valid: boolean;
    reason?: string;
  };
}

export enum SmsProviders {
  TWILIO = "twilio",
  AWS = "aws",
  AWS_SNS = "aws-sns",
  MESSAGEBIRD = "messagebird",
  HTTP = "http",
}

export type SmsFunctionType<TRequest, TResponse, TUrlVariables> = ({
  requestData,
  responseData,
  urlVariables,
  user,
}: SmsRenderProps<TRequest, TResponse, TUrlVariables>) =>
  | Promise<ResponseType<SmsTemplateReturnType | SmsTemplateReturnType[]>>
  | ResponseType<SmsTemplateReturnType | SmsTemplateReturnType[]>;

export interface SmsRenderProps<TRequest, TResponse, TUrlVariables> {
  requestData: TRequest;
  urlVariables: TUrlVariables;
  responseData: TResponse;
  user: JwtPayloadType;
}

export interface SmsTemplateReturnType {
  to: string;
  message: string;
  from?: string;
  options?: ProviderBaseOptions;
}

/**
 * Type-safe options for SMS templates
 */
export interface SmsTemplateOptions {
  provider?: SmsProviders;
  type?: string;
  datacoding?: string;
  reference?: string;
  validity?: number;
  smsType?: string;
  gateway?: number;
  attributes?: { [key: string]: string | number | boolean };
  headers?: { [key: string]: string };
  extraFields?: { [key: string]: string | number | boolean };
}

export interface SmsHandlerOptions {
  /**
   * Whether to log performance metrics
   */
  logPerformance?: boolean;

  /**
   * Maximum character length for SMS messages (provider dependent)
   */
  maxMessageLength?: number;

  /**
   * Whether to enable message truncation if exceeding maxMessageLength
   */
  enableTruncation?: boolean;
}

/**
 * Zod schema for E.164 phone number validation
 * Shared across all SMS providers for consistency
 */
export const phoneNumberSchema = z
  .string()
  .refine((value) => /^\+[1-9]\d{1,14}$/.test(value), {
    message: "Phone number must be in E.164 format (e.g., +14155552671)",
  });

/**
 * Validates a phone number for a specific provider
 * Uses the standard E.164 validation with provider-specific error messages
 */
export function validateE164PhoneNumber(
  phoneNumber: string,
  providerName: SmsProviders,
): { valid: boolean; reason?: string } {
  // Special case for HTTP provider with custom regex
  if (providerName === SmsProviders.HTTP) {
    try {
      if (env.SMS_HTTP_PHONE_REGEX) {
        const pattern = new RegExp(env.SMS_HTTP_PHONE_REGEX);
        if (!pattern.test(phoneNumber)) {
          return {
            valid: false,
            reason:
              "Invalid phone number format for the configured HTTP provider",
          };
        }
        return { valid: true };
      }
    } catch (error) {
      errorLogger(
        "Invalid SMS_HTTP_PHONE_REGEX, falling back to default",
        error,
      );
      // Fall back to standard validation if regex is invalid
    }
  }

  const result = phoneNumberSchema.safeParse(phoneNumber);
  if (!result.success) {
    return {
      valid: false,
      reason: `${providerName} requires phone numbers in E.164 format (e.g., +14155552671)`,
    };
  }
  return { valid: true };
}
