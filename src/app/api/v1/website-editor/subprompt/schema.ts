import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

// Schema for creating a subprompt
export const createSubPromptRequestSchema = z.object({
  subPrompt: z.string().min(1, { message: "Subprompt is required" }),
  UIId: z.string().uuid({ message: "Valid UI ID is required" }),
  parentSUBId: z.string().min(1, { message: "Parent SUB ID is required" }),
  code: z.string().min(1, { message: "Code is required" }),
  modelId: z.string().min(1, { message: "Model ID is required" }),
});
export type CreateSubPromptRequestType = z.infer<
  typeof createSubPromptRequestSchema
>;

// Schema for code response
export const codeResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
});
export type CodeResponseType = z.infer<typeof codeResponseSchema>;

// Schema for subprompt response
export const subPromptResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: dateSchema,
  subPrompt: z.string(),
  UIId: z.string().uuid(),
  SUBId: z.string(),
  modelId: z.string().nullable(),
  code: codeResponseSchema,
});
export type SubPromptResponseType = z.infer<typeof subPromptResponseSchema>;

// Alias for create subprompt response
export const createSubPromptResponseSchema = subPromptResponseSchema;
export type CreateSubPromptResponseType = SubPromptResponseType;

// Schema for getting a subprompt by ID
export const getSubPromptRequestSchema = z.object({
  id: z.string().uuid({ message: "Valid subprompt ID is required" }),
});
export type GetSubPromptRequestType = z.infer<typeof getSubPromptRequestSchema>;

// Schema for get subprompt response
export const getSubPromptResponseSchema = subPromptResponseSchema;
export type GetSubPromptResponseType = SubPromptResponseType;

// Schema for listing subprompts
export const listSubPromptsRequestSchema = z.object({
  UIId: z.string().uuid({ message: "Valid UI ID is required" }),
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
});
export type ListSubPromptsRequestType = z.infer<
  typeof listSubPromptsRequestSchema
>;

// Schema for list subprompts response
export const listSubPromptsResponseSchema = z.object({
  subPrompts: z.array(subPromptResponseSchema),
  total: z.number().int().nonnegative(),
});
export type ListSubPromptsResponseType = z.infer<
  typeof listSubPromptsResponseSchema
>;
