import { z } from "zod";

export const templatePostRequestSchema = z.object({
  someInputValue: z.string().min(1, { message: "Some Value is required" }),
});
export type TemplatePostRequestType = z.infer<typeof templatePostRequestSchema>;

export const templatePostRequestUrlParamsSchema = z.object({
  someValueFromTheRouteUrl: z
    .string()
    .min(1, { message: "Some Value is required" }),
});
export type TemplatePostRequestUrlParamsType = z.infer<
  typeof templatePostRequestUrlParamsSchema
>;

export const templatePostResponseSchema = z.object({
  someOutputValue: z.string().min(1, { message: "Some Value is required" }),
});
export type TemplatePostResponseInputType = z.input<
  typeof templatePostResponseSchema
>;
export type TemplatePostResponseOutputType = z.input<
  typeof templatePostResponseSchema
>;
