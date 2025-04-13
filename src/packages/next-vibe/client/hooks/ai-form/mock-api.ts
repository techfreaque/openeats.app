"use client";

import { z } from "zod";

import { Methods } from "../../../shared/types/endpoint";
import { UserRoleValue } from "../../../shared/types/enums";
import { createEndpoint } from "../../endpoint-simplified";
import type { ChatMessage } from "./types";
import { ChatMessageRole } from "./types";

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
  formSchema: z.record(z.any()).optional(),
  fieldDescriptions: z.record(z.string()).optional(),
});

/**
 * Response schema for the LLM API
 */
export const llmApiResponseSchema = z.object({
  message: z.object({
    role: z.enum([ChatMessageRole.ASSISTANT]),
    content: z.string(),
  }),
  parsedFields: z.record(z.any()).optional(),
});

/**
 * Create the LLM API endpoint
 */
export const llmApiEndpoint = createEndpoint({
  description: "Chat with an AI assistant to fill a form",
  method: Methods.POST,
  path: ["ai", "chat"],
  requestSchema: llmApiRequestSchema,
  responseSchema: llmApiResponseSchema,
  requestUrlSchema: z.object({}),
  allowedRoles: [UserRoleValue.USER, UserRoleValue.ADMIN],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    500: "Server error",
  },
});

/**
 * Type for the mock LLM API parameters
 */
export interface MockLlmApiParams {
  messages: ChatMessage[];
  formSchema?: any;
  fieldDescriptions?: Record<string, string>;
  retryDelayMs?: number;
}

/**
 * Mock implementation of the LLM API for testing
 * In a real implementation, this would call an actual LLM API
 */
export async function mockLlmApi({
  messages,
  formSchema,
  fieldDescriptions,
  retryDelayMs = 1000,
}: MockLlmApiParams) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, retryDelayMs));

  // Extract the last user message
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === ChatMessageRole.USER);

  if (!lastUserMessage) {
    return {
      message: {
        role: ChatMessageRole.ASSISTANT,
        content:
          "Hello! I'm here to help you fill out this form. What information would you like to provide?",
      },
      parsedFields: {},
    };
  }

  // Simple mock implementation that tries to parse field values from the user message
  const parsedFields: Record<string, any> = {};

  if (formSchema) {
    // Extract field names from the schema
    const fieldNames = Object.keys(formSchema.shape || {});

    // Very simple parsing logic for demonstration
    for (const fieldName of fieldNames) {
      // Look for patterns like "field: value" or "field = value"
      const regex = new RegExp(`${fieldName}[:\\s=]+([^,\\.\\n]+)`, "i");
      const match = lastUserMessage.content.match(regex);

      if (match?.[1]) {
        parsedFields[fieldName] = match[1].trim();
      }
    }
  }

  // Generate a response based on the parsed fields
  let responseContent = "";

  // Helper function to get field descriptions
  const getFieldDescription = (field: string): string => {
    return fieldDescriptions?.[field] || field;
  };

  // Helper function to get missing fields
  const getMissingFields = (): string[] => {
    if (!formSchema) {
      return [];
    }
    return Object.keys(formSchema.shape || {}).filter(
      (field) => !parsedFields[field],
    );
  };

  // Helper function to get all required fields
  const getAllFields = (): string[] => {
    if (!formSchema) {
      return [];
    }
    return Object.keys(formSchema.shape || {});
  };

  if (Object.keys(parsedFields).length > 0) {
    responseContent = "I've captured the following information:\n\n";

    for (const [field, value] of Object.entries(parsedFields)) {
      responseContent += `- ${getFieldDescription(field)}: ${value}\n`;
    }

    // Check for missing fields
    const missingFields = getMissingFields();

    if (missingFields.length > 0) {
      responseContent += "\nI still need the following information:\n\n";

      for (const field of missingFields) {
        responseContent += `- ${getFieldDescription(field)}\n`;
      }
    } else {
      responseContent +=
        "\nGreat! I have all the information needed for the form. You can review and submit when ready.";
    }
  } else {
    // Check if the user is asking to submit the form
    if (lastUserMessage.content.toLowerCase().includes("submit")) {
      const missingFields = getMissingFields();

      if (missingFields.length > 0) {
        responseContent =
          "I can't submit the form yet because some required information is missing:\n\n";

        for (const field of missingFields) {
          responseContent += `- ${getFieldDescription(field)}\n`;
        }
      } else {
        responseContent = "I'm submitting the form now...";
      }
    } else {
      responseContent =
        "I couldn't extract any specific information for the form fields. Could you please provide details in a format like 'field: value'?";

      const allFields = getAllFields();
      if (allFields.length > 0) {
        responseContent +=
          "\n\nHere are the fields I need information for:\n\n";

        for (const field of allFields) {
          responseContent += `- ${getFieldDescription(field)}\n`;
        }
      }
    }
  }

  return {
    message: {
      role: ChatMessageRole.ASSISTANT,
      content: responseContent,
    },
    parsedFields,
  };
}
