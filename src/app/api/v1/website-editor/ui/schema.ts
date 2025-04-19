import { z } from "zod";

// Schema for updating a UI component
export const updateUiRequestSchema = z.object({
  id: z.string().uuid({ message: "Valid UI ID is required" }),
  img: z.string().optional(),
  prompt: z.string().optional(),
});
export type UpdateUiRequestType = z.infer<typeof updateUiRequestSchema>;

// Schema for update UI response
export const updateUiResponseSchema = z.object({
  id: z.string().uuid(),
  img: z.string().optional(),
  prompt: z.string().optional(),
});
export type UpdateUiResponseType = z.infer<typeof updateUiResponseSchema>;

// Schema for deleting a UI component
export const deleteUiRequestSchema = z.object({
  id: z.string().uuid({ message: "Valid UI ID is required" }),
});
export type DeleteUiRequestType = z.infer<typeof deleteUiRequestSchema>;

// Schema for delete UI response
export const deleteUiResponseSchema = z.object({
  success: z.boolean(),
});
export type DeleteUiResponseType = z.infer<typeof deleteUiResponseSchema>;
