import { ErrorResponseTypes, type ResponseType } from "next-vibe/shared";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { z } from "zod";

import { env } from "../../env";
import {
  phoneNumberSchema,
  type SendSmsParams,
  type SmsProvider,
  SmsProviders,
  type SmsResponseData,
  type SmsResult,
  type SmsResultMetadata,
} from "../utils";

// Define specific interfaces instead of Record types
interface HttpErrorResponse {
  message: string;
  code?: number | string;
  status?: number | string;
  description?: string;
  details?: string;
}

interface HttpRequestBody {
  [key: string]: string | number | boolean;
}

interface HttpResponseData {
  [key: string]: string | number | boolean | null | HttpResponseData;
}

/**
 * HTTP Generic SMS Provider
 * Can be configured to work with virtually any HTTP-based SMS API
 */
export function getHttpProvider(): SmsProvider {
  // Cache the API URL to avoid repeated environment lookups
  const apiUrl = env.SMS_HTTP_API_URL;
  const apiKey = env.SMS_HTTP_API_KEY;
  const apiMethod = env.SMS_HTTP_API_METHOD ?? "POST";

  // Validate required configuration
  if (!apiUrl) {
    throw new Error("Missing SMS_HTTP_API_URL environment variable");
  }

  // Field mappings (configurable)
  const toField = env.SMS_HTTP_TO_FIELD ?? "to";
  const messageField = env.SMS_HTTP_MESSAGE_FIELD ?? "message";
  const fromField = env.SMS_HTTP_FROM_FIELD ?? "from";
  const messageIdField = env.SMS_HTTP_RESPONSE_ID_FIELD ?? "id";

  // Cache additional configuration settings
  const additionalHeaders: Record<string, string> = {};
  try {
    if (env.SMS_HTTP_CUSTOM_HEADERS) {
      // Fix unsafe JSON.parse by using a type assertion after parsing
      const parsed = JSON.parse(env.SMS_HTTP_CUSTOM_HEADERS) as Record<
        string,
        unknown
      >;
      // Safely iterate and add only string values to headers
      Object.entries(parsed).forEach(([key, value]) => {
        if (typeof value === "string") {
          additionalHeaders[key] = value;
        }
      });
    }
  } catch (error) {
    debugLogger("Failed to parse SMS_HTTP_CUSTOM_HEADERS", error);
  }

  return {
    name: SmsProviders.HTTP,

    validatePhoneNumber(phoneNumber: string): {
      valid: boolean;
      reason?: string;
    } {
      // For HTTP provider, we allow custom regex via env vars
      // Otherwise use the standard E.164 validation
      let pattern: RegExp;
      try {
        if (env.SMS_HTTP_PHONE_REGEX) {
          pattern = new RegExp(env.SMS_HTTP_PHONE_REGEX);
          const customSchema = z
            .string()
            .refine((value) => pattern.test(value), {
              message:
                "Invalid phone number format for the configured HTTP provider",
            });

          const result = customSchema.safeParse(phoneNumber);
          if (!result.success) {
            return {
              valid: false,
              reason:
                result.error.errors[0]?.message ??
                "Invalid phone number format for the configured HTTP provider",
            };
          }
          return { valid: true };
        }
      } catch (error) {
        debugLogger(
          "Invalid SMS_HTTP_PHONE_REGEX, falling back to default",
          error,
        );
      }

      // Fall back to standard E.164 validation
      const result = phoneNumberSchema.safeParse(phoneNumber);
      if (!result.success) {
        return {
          valid: false,
          reason:
            "Invalid phone number format for the configured HTTP provider",
        };
      }
      return { valid: true };
    },

    async sendSms(params: SendSmsParams): Promise<ResponseType<SmsResult>> {
      try {
        debugLogger("Sending SMS via HTTP provider", { to: params.to });

        // Validate required parameters
        if (!params.to) {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Recipient phone number (to) is required",
          };
        }

        if (!params.message || params.message.trim() === "") {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Message content cannot be empty",
          };
        }

        // Default to JSON content type
        const contentType = env.SMS_HTTP_CONTENT_TYPE ?? "application/json";

        // Prepare headers
        const headers: Record<string, string> = {
          "Content-Type": contentType,
          ...additionalHeaders,
        };

        // Add authorization header if API key is provided
        if (apiKey) {
          const authScheme = env.SMS_HTTP_AUTH_SCHEME ?? "Bearer";
          headers["Authorization"] = `${authScheme} ${apiKey}`;
        }

        // Add custom headers from options with type safety
        if (
          params.options &&
          typeof params.options === "object" &&
          params.options.headers &&
          typeof params.options.headers === "object"
        ) {
          // Safely iterate through headers
          Object.entries(params.options.headers).forEach(([key, value]) => {
            if (typeof key === "string" && typeof value === "string") {
              headers[key] = value;
            }
          });
        }

        // Build the request body based on the content type
        let body: string;
        let parsedUrl = apiUrl;

        // The body structure can be customized through env vars
        const requestBody: HttpRequestBody = {
          [toField]: params.to,
          [messageField]: params.message,
        };

        if (params.from) {
          requestBody[fromField] = params.from;
        }

        // Add any extra fields from options with proper typing
        if (
          params.options &&
          typeof params.options === "object" &&
          params.options.extraFields &&
          typeof params.options.extraFields === "object"
        ) {
          Object.entries(params.options.extraFields).forEach(([key, value]) => {
            if (
              typeof value === "string" ||
              typeof value === "number" ||
              typeof value === "boolean"
            ) {
              requestBody[key] = value;
            }
          });
        }

        // Special handling for form-urlencoded content
        if (contentType === "application/x-www-form-urlencoded") {
          const formData = new URLSearchParams();
          Object.entries(requestBody).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
          body = formData.toString();
        }
        // URL query parameters (for GET requests)
        else if (apiMethod === "GET") {
          const url = new URL(apiUrl);
          Object.entries(requestBody).forEach(([key, value]) => {
            url.searchParams.append(key, String(value));
          });
          parsedUrl = url.toString();
          body = "";
        }
        // Default to JSON
        else {
          body = JSON.stringify(requestBody);
        }

        // Make the API request with type-safe handling of body
        const requestInit: RequestInit = {
          method: apiMethod,
          headers,
        };

        // Only add the body property if it's not a GET request
        if (apiMethod !== "GET") {
          requestInit.body = body;
        }

        const response = await fetch(parsedUrl, requestInit);

        // Handle HTTP errors
        if (!response.ok) {
          let errorData: HttpErrorResponse = { message: "Unknown error" };
          try {
            const contentTypeHeader =
              response.headers.get("content-type") ?? "";
            if (contentTypeHeader.includes("application/json")) {
              const jsonData = (await response.json()) as { message?: string };
              errorData = {
                message:
                  typeof jsonData.message === "string"
                    ? jsonData.message
                    : "Unknown API error",
                ...jsonData,
              };
            } else {
              errorData = { message: await response.text() };
            }
          } catch {
            // Intentionally empty catch block, errorData is already set with a default
          }

          return {
            success: false,
            errorType: ErrorResponseTypes.SMS_ERROR,
            message: `HTTP SMS API error ${response.status}: ${errorData.message}`,
            errorCode: response.status,
          };
        }

        // Parse successful response
        let data: SmsResponseData;
        try {
          const contentTypeHeader = response.headers.get("content-type") ?? "";
          if (contentTypeHeader.includes("application/json")) {
            data = (await response.json()) as SmsResponseData;
          } else {
            data = { raw: await response.text() };
          }
        } catch {
          // Intentionally empty catch block
          data = { raw: "Non-parseable response" };
        }

        // Extract message ID from response based on configuration
        let messageId: string;
        const extractNestedValue = (
          obj: HttpResponseData,
          path: string[],
        ): string | undefined => {
          // Start with the object and handle type narrowing
          let current: unknown = obj;

          for (const segment of path) {
            // Safety check for type
            if (current === null || typeof current !== "object") {
              return undefined;
            }

            // Check if the current object has the property
            const typedCurrent = current as Record<string, unknown>;
            if (!(segment in typedCurrent)) {
              return undefined;
            }

            // Move to the nested property
            current = typedCurrent[segment];
          }

          // Return the value if it's a string
          return typeof current === "string" ? current : undefined;
        };

        // Extract message ID using helper function
        if (typeof data === "object" && data !== null) {
          const fieldPath = messageIdField.split(".");
          const extractedId = extractNestedValue(data, fieldPath);
          messageId = extractedId ?? `http-${Date.now()}`;
        } else {
          messageId = `http-${Date.now()}`;
        }

        // Build a properly typed metadata object
        const metadata: SmsResultMetadata = {
          responseStatus: response.status,
          responseData: data,
        };

        // Build the response object with optional properties correctly handled
        const responseData: SmsResult = {
          messageId,
          provider: SmsProviders.HTTP,
          timestamp: new Date().toISOString(),
          to: params.to,
          metadata,
        };

        return {
          success: true,
          data: responseData,
        };
      } catch (error) {
        return {
          success: false,
          errorType: ErrorResponseTypes.SMS_ERROR,
          message: `HTTP SMS API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  };
}
