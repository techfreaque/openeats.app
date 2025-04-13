import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { ChatMessageRole, llmApiRequestSchema, llmApiResponseSchema } from "./schema";

/**
 * AI Chat API endpoint definition
 */
const aiChatEndpoint = createEndpoint({
  description: "Chat with an AI assistant to fill a form",
  path: ["v1", "ai", "chat"],
  method: Methods.POST,
  requestSchema: llmApiRequestSchema,
  responseSchema: llmApiResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: {
    messages: "Array of chat messages",
    formSchema: "Optional form schema for field validation",
    fieldDescriptions: "Optional descriptions for form fields",
  },
  apiQueryOptions: {
    queryKey: ["ai-chat"],
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    500: "Server error",
  },
  examples: {
    urlPathVariables: undefined,
    payloads: {
      default: {
        messages: [
          {
            role: ChatMessageRole.USER,
            content: "I'd like to provide my name and email",
          },
        ],
        formSchema: {},
        fieldDescriptions: {
          name: "Your full name",
          email: "Your email address",
        },
      },
    },
    responses: {
      default: {
        message: {
          role: ChatMessageRole.ASSISTANT,
          content: "I've captured your information. Thank you!",
          timestamp: Date.now(),
        },
        parsedFields: {
          name: "John Doe",
          email: "john@example.com",
        },
      },
    },
  },
});

/**
 * AI Chat API endpoints
 */
const definition = {
  ...aiChatEndpoint,
};

export default definition;
