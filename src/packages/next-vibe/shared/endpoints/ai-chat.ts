import { z } from "zod";

import { createEndpoint } from "../../client/endpoint";
import { undefinedSchema } from "../types/common.schema";
import { Methods } from "../types/endpoint";
import { UserRoleValue } from "../types/enums";

/**
 * Chat message role enum
 */
export enum ChatMessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

/**
 * Request schema for the LLM API
 */
export const llmApiRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum([
        ChatMessageRole.SYSTEM,
        ChatMessageRole.USER,
        ChatMessageRole.ASSISTANT,
      ]),
      content: z.string(),
    }),
  ),
  formSchema: z.record(z.unknown()).optional(),
  fieldDescriptions: z.record(z.string()).optional(),
});
export type LlmApiRequestType = z.infer<typeof llmApiRequestSchema>;

/**
 * Response schema for the LLM API
 */
export const llmApiResponseSchema = z.object({
  message: z.object({
    role: z.enum([ChatMessageRole.ASSISTANT]),
    content: z.string(),
    timestamp: z.number(),
  }),
  parsedFields: z.record(z.unknown()).optional(),
});
export type LlmApiResponseType = z.infer<typeof llmApiResponseSchema>;

/**
 * AI Chat API endpoint definition
 */
export const llmApiEndpoint = createEndpoint<
  LlmApiRequestType,
  LlmApiResponseType,
  undefined,
  Methods.POST,
  "default"
>({
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
        formSchema: { name: "string", email: "string" },
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
          content: "I'll help you fill out the form. What's your name?",
          timestamp: 1617235200000,
        },
        parsedFields: {
          name: "John Doe",
        },
      },
    },
  },
});
