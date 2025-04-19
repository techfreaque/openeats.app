import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

import { codeResponseSchema } from "../../subprompt/schema";

// Schema for forking a UI component
export const forkUiRequestSchema = z.object({
  uiId: z.string().uuid({ message: "Valid UI ID is required" }),
});
export type ForkUiRequestType = z.infer<typeof forkUiRequestSchema>;

// Schema for user response
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  imageUrl: z.string().nullable().optional(),
});
export type UserResponseType = z.infer<typeof userResponseSchema>;

// Schema for subprompt response
export const subPromptResponseSchema = z.object({
  id: z.string().uuid(),
  UIId: z.string().uuid(),
  SUBId: z.string(),
  createdAt: dateSchema,
  subPrompt: z.string(),
  modelId: z.string().nullable(),
  code: codeResponseSchema,
});
export type SubPromptResponseType = z.infer<typeof subPromptResponseSchema>;

// Schema for fork UI response
export const forkUiResponseSchema = z.object({
  id: z.string().uuid(),
  uiType: z.string(),
  user: userResponseSchema,
  prompt: z.string(),
  public: z.boolean(),
  img: z.string(),
  viewCount: z.number().int(),
  likesCount: z.number().int(),
  forkedFrom: z.string().uuid(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  subPrompts: z.array(subPromptResponseSchema),
});
export type ForkUiResponseType = z.infer<typeof forkUiResponseSchema>;
