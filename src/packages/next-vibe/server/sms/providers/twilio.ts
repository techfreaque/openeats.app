import type { ResponseType } from "../../../shared/types/response.schema";
import { ErrorResponseTypes } from "../../../shared/types/response.schema";
import { debugLogger } from "../../../shared/utils/logger";
import { env } from "../../env";
import type { SendSmsParams, SmsProvider, SmsResult } from "../utils";
import { SmsProviders } from "../utils";

// Define interfaces for Twilio responses
interface TwilioErrorResponse {
  message?: string;
  error_message?: string;
  code?: string | number;
  error_code?: string | number;
}

interface TwilioSuccessResponse {
  sid: string;
  status?: string;
  num_segments?: string;
  price?: string;
  price_unit?: string;
  direction?: string;
  uri?: string;
  account_sid?: string;
}

/**
 * Creates a Twilio SMS provider instance
 */
export function getTwilioProvider(): SmsProvider {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const region = env.TWILIO_REGION;

  // Validate credentials at initialization time
  if (!accountSid) {
    throw new Error("Missing TWILIO_ACCOUNT_SID environment variable");
  }

  if (!authToken) {
    throw new Error("Missing TWILIO_AUTH_TOKEN environment variable");
  }

  // Cache API base URL
  const baseUrl = region
    ? `https://api.${region}.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    : `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  // Create authorization header value only once
  const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;

  return {
    name: SmsProviders.TWILIO,

    async sendSms(params: SendSmsParams): Promise<ResponseType<SmsResult>> {
      try {
        // Type guard for params
        if (!params || typeof params !== "object") {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Invalid SMS parameters",
          };
        }

        debugLogger("Sending SMS via Twilio", { to: params.to });

        // Validate required parameters
        if (!params.to) {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Recipient phone number (to) is required",
          };
        }

        // From phone number fallback with nullish coalescing
        const fromNumber = params.from ?? env.SMS_FROM_NUMBER;
        if (!fromNumber) {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message:
              "From phone number is required (either in params or SMS_FROM_NUMBER env var)",
          };
        }

        if (
          !params.message ||
          typeof params.message !== "string" ||
          params.message.trim() === ""
        ) {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Message content cannot be empty",
          };
        }

        // Prepare request body
        const formData = new URLSearchParams({
          To: params.to,
          From: fromNumber,
          Body: params.message,
        });

        // Add any extra parameters from options with type safety
        if (params.options && typeof params.options === "object") {
          // Type guard for options
          const optionsEntries = Object.entries(params.options);

          optionsEntries.forEach(([key, value]) => {
            if (
              !["headers", "extraFields", "provider"].includes(key) &&
              (typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean")
            ) {
              formData.append(key, String(value));
            }
          });
        }

        // Type-safe headers handling
        const headers: {
          "Content-Type": string;
          "Authorization": string;
          [key: string]: string;
        } = {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": authHeader,
        };

        // Type-safe header merging
        if (
          params.options?.headers &&
          typeof params.options.headers === "object"
        ) {
          // Type guard for headers
          const headersObj = params.options.headers;
          Object.entries(headersObj).forEach(([key, value]) => {
            if (typeof value === "string") {
              headers[key] = value;
            }
          });
        }

        // Make the API request
        const response = await fetch(baseUrl, {
          method: "POST",
          headers,
          body: formData.toString(),
        });

        // Handle API errors
        if (!response.ok) {
          let errorData: TwilioErrorResponse = {};
          try {
            errorData = (await response.json()) as TwilioErrorResponse;
          } catch {
            errorData = { message: "Failed to parse error response" };
          }

          const errorMessage =
            errorData.message ??
            errorData.error_message ??
            "Unknown Twilio API error";

          const errorCode =
            errorData.code ?? errorData.error_code ?? response.status;

          return {
            success: false,
            errorType: ErrorResponseTypes.SMS_ERROR,
            message: `Twilio API error ${errorCode}: ${errorMessage}`,
            errorCode: response.status,
          };
        }

        // Parse successful response
        const data = (await response.json()) as TwilioSuccessResponse;

        // Build the response object with optional properties correctly handled
        const responseData: SmsResult = {
          messageId: data.sid,
          provider: SmsProviders.TWILIO,
          timestamp: new Date().toISOString(),
          to: params.to,
          ...(data.status && { status: data.status }),
          segments: data.num_segments ? parseInt(data.num_segments, 10) : 1,
          metadata: {
            ...(data.direction && { direction: data.direction }),
            ...(data.uri && { uri: data.uri }),
            ...(data.account_sid && { accountSid: data.account_sid }),
          },
        };

        // Add cost information if available
        if (data.price && data.price_unit) {
          responseData.cost = {
            amount: parseFloat(data.price),
            currency: data.price_unit,
          };
        }

        return {
          success: true,
          data: responseData,
        };
      } catch (error) {
        return {
          success: false,
          errorType: ErrorResponseTypes.SMS_ERROR,
          message: `Twilio error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  };
}
