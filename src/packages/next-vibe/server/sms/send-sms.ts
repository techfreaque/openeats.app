import "server-only";

import type { ResponseType } from "../../shared/types/response.schema";
import { ErrorResponseTypes } from "../../shared/types/response.schema";
import { debugLogger, errorLogger } from "../../shared/utils/logger";
import { env } from "../env";
import { getAwsSnsProvider } from "./providers/aws-sns";
import { getHttpProvider } from "./providers/http";
import { getMessageBirdProvider } from "./providers/messagebird";
import { getTwilioProvider } from "./providers/twilio";
import type { SendSmsParams, SmsProvider, SmsResult } from "./utils";
import { SmsProviders, validateE164PhoneNumber } from "./utils";

/**
 * Cache to store provider instances
 */
const providerCache: Record<string, SmsProvider> = {};

/**
 * Gets the configured SMS provider based on environment settings
 * Uses a cache to avoid recreating providers
 */
export function getSmsProvider(providerName?: SmsProviders): SmsProvider {
  const name = providerName ?? env.SMS_PROVIDER ?? SmsProviders.TWILIO;

  // Return cached provider if available
  if (providerCache[name]) {
    return providerCache[name];
  }

  let provider: SmsProvider;

  switch (name.toLowerCase()) {
    case "twilio":
      provider = getTwilioProvider();
      break;
    case "aws":
    case "sns":
    case "aws-sns":
      provider = getAwsSnsProvider();
      break;
    case "messagebird":
      provider = getMessageBirdProvider();
      break;
    case "http":
      provider = getHttpProvider();
      break;
    default:
      throw new Error(`Unsupported SMS provider: ${name}`);
  }

  // Cache the provider
  providerCache[name] = provider;
  return provider;
}

/**
 * Validates a phone number format
 * Using Zod validation for E.164 format (e.g., +14155552671)
 */
export function validatePhoneNumber(
  phoneNumber: string,
  providerName?: SmsProviders,
): {
  valid: boolean;
  reason?: string;
} {
  // Use provider's validation if available
  const provider = getSmsProvider(providerName);
  if (provider.validatePhoneNumber) {
    return provider.validatePhoneNumber(phoneNumber);
  }

  // Use the shared validation helper
  return validateE164PhoneNumber(phoneNumber, provider.name);
}

/**
 * Sends an SMS using the configured provider with retry logic
 */
export async function sendSms(
  params: SendSmsParams,
): Promise<ResponseType<SmsResult>> {
  const maxAttempts =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    params.retry?.attempts || parseInt(env.SMS_MAX_RETRY_ATTEMPTS || "3", 10);
  const delayMs =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    params.retry?.delayMs || parseInt(env.SMS_RETRY_DELAY_MS || "1000", 10);

  // Validate phone number
  const validation = validatePhoneNumber(params.to);
  if (!validation.valid) {
    return {
      success: false,
      errorType: ErrorResponseTypes.VALIDATION_ERROR,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      message: validation.reason || "Invalid phone number format",
    };
  }

  try {
    const provider = getSmsProvider(params.options?.provider);
    debugLogger(`Sending SMS to ${params.to} using ${provider.name} provider`);

    // Use default from number if not provided
    const smsParams: SendSmsParams = {
      ...params,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      from: params.from || env.SMS_FROM_NUMBER,
    };

    let lastError: unknown;

    // Implement retry logic
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        debugLogger(`SMS attempt ${attempt}/${maxAttempts} to ${params.to}`);
        const result = await provider.sendSms(smsParams);

        if (result.success) {
          debugLogger(`SMS sent successfully to ${params.to}`, result.data);
          return result;
        }

        lastError = new Error(result.message);

        if (attempt < maxAttempts) {
          // Wait before retry - fix promise executor issue
          await new Promise<void>((resolve) => {
            setTimeout(resolve, delayMs);
          });
        }
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          // Wait before retry - fix promise executor issue
          await new Promise<void>((resolve) => {
            setTimeout(resolve, delayMs);
          });
        }
      }
    }

    // If we get here, all attempts failed
    errorLogger(
      `Failed to send SMS to ${params.to} after ${maxAttempts} attempts:`,
      lastError,
    );
    return {
      success: false,
      errorType: ErrorResponseTypes.SMS_ERROR,
      message:
        lastError instanceof Error
          ? `Failed after ${maxAttempts} attempts: ${lastError.message}`
          : `Failed to send SMS after ${maxAttempts} attempts`,
    };
  } catch (error) {
    errorLogger("Unexpected error sending SMS:", error);
    return {
      success: false,
      errorType: ErrorResponseTypes.SMS_ERROR,
      message: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}

/**
 * Batch send SMS messages to multiple recipients
 */
export async function batchSendSms(messages: SendSmsParams[]): Promise<
  ResponseType<{
    results: Array<{
      to: string;
      success: boolean;
      messageId: string | undefined;
      error: string | undefined;
    }>;
  }>
> {
  const results: Array<{
    to: string;
    success: boolean;
    messageId: string | undefined;
    error: string | undefined;
  }> = await Promise.all(
    messages.map(async (params) => {
      const result = await sendSms(params);
      return {
        to: params.to,
        success: result.success,
        messageId: result.success ? result.data.messageId : undefined,
        error: !result.success ? result.message : undefined,
      };
    }),
  );

  const failureCount = results.filter((r) => !r.success).length;

  if (failureCount === results.length) {
    return {
      success: false,
      errorType: ErrorResponseTypes.SMS_ERROR,
      message: `All ${results.length} SMS messages failed to send`,
      data: { results },
    };
  }

  if (failureCount > 0) {
    return {
      success: false,
      errorType: ErrorResponseTypes.SMS_ERROR,
      message: `${results.length - failureCount}/${results.length} SMS messages sent successfully`,
      data: { results },
    };
  }

  return {
    success: true,
    data: { results },
  };
}
