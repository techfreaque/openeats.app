import { ErrorResponseTypes, type ResponseType } from "next-vibe/shared";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { env } from "../../env";
import type {
  SendSmsParams,
  SmsProvider,
  SmsResult,
  SmsResultMetadata,
} from "../utils";
import { SmsProviders } from "../utils";

// Define interfaces for MessageBird responses
interface MessageBirdErrorItem {
  description?: string;
  message?: string;
}

interface MessageBirdErrorResponse {
  errors?: MessageBirdErrorItem[];
}

interface MessageBirdPrice {
  amount?: number;
  currency?: string;
}

interface MessageBirdRecipientItem {
  recipient?: string;
}

interface MessageBirdRecipients {
  items?: MessageBirdRecipientItem[];
}

interface MessageBirdSuccessResponse {
  id: string;
  status?: string;
  parts?: number;
  price?: MessageBirdPrice;
  reference?: string;
  createdDatetime?: string;
  recipients?: MessageBirdRecipients;
  gateway?: string;
}

/**
 * Creates a MessageBird provider for SMS sending
 */
export function getMessageBirdProvider(): SmsProvider {
  const accessKey = env.MESSAGEBIRD_ACCESS_KEY;

  // Validate credentials at initialization time
  if (!accessKey) {
    throw new Error("Missing MESSAGEBIRD_ACCESS_KEY environment variable");
  }

  // Cache API URL
  const apiUrl = "https://rest.messagebird.com/messages";

  return {
    name: SmsProviders.MESSAGEBIRD,

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

        debugLogger("Sending SMS via MessageBird", { to: params.to });

        // Validate required parameters
        if (!params.to) {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Recipient phone number (to) is required",
          };
        }

        // From phone number fallback with nullish coalescing
        const originator = params.from ?? env.SMS_FROM_NUMBER;
        if (!originator) {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message:
              "From phone number or name is required (either in params or SMS_FROM_NUMBER env var)",
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

        // Build the request body
        interface MessageBirdRequestBody {
          recipients: string;
          originator: string;
          body: string;
          type?: string;
          datacoding?: string;
          reference?: string;
          validity?: number | string;
          gateway?: number | string;
        }

        // Create properly typed request body
        const requestData: MessageBirdRequestBody = {
          recipients: params.to,
          originator,
          body: params.message,
        };

        // Type guard for options
        const options = params.options;
        if (options && typeof options === "object") {
          // Add optional parameters with type checking
          if (typeof options.type === "string") {
            requestData.type = options.type;
          }

          if (typeof options.datacoding === "string") {
            requestData.datacoding = options.datacoding;
          }

          if (typeof options.reference === "string") {
            requestData.reference = options.reference;
          }

          if (
            typeof options.validity === "number" ||
            typeof options.validity === "string"
          ) {
            requestData.validity = options.validity;
          }

          if (
            typeof options.gateway === "number" ||
            typeof options.gateway === "string"
          ) {
            requestData.gateway = options.gateway;
          }
        }

        // Make the API request
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Authorization": `AccessKey ${accessKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        // Handle API errors
        if (!response.ok) {
          let errorData: MessageBirdErrorResponse = {};
          try {
            errorData = (await response.json()) as MessageBirdErrorResponse;
          } catch {
            errorData = {
              errors: [{ description: "Failed to parse error response" }],
            };
          }

          let errorMessage = "Unknown MessageBird API error";
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors
              .map((e) => e.description ?? e.message ?? "Unknown error")
              .join(", ");
          }

          return {
            success: false,
            errorType: ErrorResponseTypes.SMS_ERROR,
            message: `MessageBird API error: ${errorMessage}`,
            errorCode: response.status,
          };
        }

        // Parse successful response
        const data = (await response.json()) as MessageBirdSuccessResponse;

        // Extract cost information if available
        let cost = undefined;
        if (data.price?.amount !== undefined && data.price?.currency) {
          cost = {
            amount: parseFloat(String(data.price.amount)),
            currency: data.price.currency,
          };
        }

        // Build metadata object with conditional properties to satisfy exactOptionalPropertyTypes
        const metadata: SmsResultMetadata = {
          // Only include properties that have values
          ...(data.reference && { reference: data.reference }),
          ...(data.createdDatetime && {
            createdDatetime: data.createdDatetime,
          }),
          ...(data.recipients?.items?.[0]?.recipient && {
            recipient: data.recipients.items[0].recipient,
          }),
          ...(data.gateway && { gateway: data.gateway }),
        };

        // Build the response object with proper conditional properties
        const responseObject: Omit<SmsResult, "cost"> = {
          messageId: data.id,
          provider: SmsProviders.MESSAGEBIRD,
          timestamp: new Date().toISOString(),
          to: params.to,
          ...(data.status && { status: data.status }),
          segments: data.parts ?? 1,
          metadata,
        };

        // Only conditionally add cost if it exists
        if (data.price?.amount !== undefined && data.price?.currency) {
          return {
            success: true,
            data: {
              ...responseObject,
              cost: {
                amount: parseFloat(String(data.price.amount)),
                currency: data.price.currency,
              },
            },
          };
        }

        return {
          success: true,
          data: responseObject,
        };
      } catch (error) {
        return {
          success: false,
          errorType: ErrorResponseTypes.SMS_ERROR,
          message: `MessageBird error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  };
}
