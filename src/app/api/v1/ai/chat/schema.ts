import { z } from "zod";

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
