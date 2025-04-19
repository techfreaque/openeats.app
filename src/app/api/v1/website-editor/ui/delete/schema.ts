import { z } from "zod";

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
