import { z } from "zod";

/**
 * Template API schemas
 * This is a reference implementation for API schemas
 */

/**
 * Request schema for template API
 */
export const templatePostRequestSchema = z.object({
  someInputValue: z.string().min(1, { message: "Some Value is required" }),
});
export type TemplatePostRequestType = z.infer<typeof templatePostRequestSchema>;

/**
 * URL parameters schema for template API
 */
export const templatePostRequestUrlParamsSchema = z.object({
  someValueFromTheRouteUrl: z
    .string()
    .min(1, { message: "Some Value is required" }),
});
export type TemplatePostRequestUrlParamsType = z.infer<
  typeof templatePostRequestUrlParamsSchema
>;

/**
 * Response schema for template API
 */
export const templatePostResponseSchema = z.object({
  someOutputValue: z.string().min(1, { message: "Some Value is required" }),
});
export type TemplatePostResponseType = z.infer<
  typeof templatePostResponseSchema
>;

// Export common types for use in hooks
export type TemplateCreateType = TemplatePostRequestType;
export type TemplateUpdateType = TemplatePostRequestType;
export type TemplateResponseType = TemplatePostResponseType;
