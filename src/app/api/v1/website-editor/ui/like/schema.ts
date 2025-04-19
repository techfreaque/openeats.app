import { z } from "zod";

// Schema for toggling a like on a UI component
export const toggleLikeRequestSchema = z.object({
  UIId: z.string().uuid({ message: "Valid UI ID is required" }),
});
export type ToggleLikeRequestType = z.infer<typeof toggleLikeRequestSchema>;

// Schema for toggle like response
export const toggleLikeResponseSchema = z.object({
  liked: z.boolean(),
});
export type ToggleLikeResponseType = z.infer<typeof toggleLikeResponseSchema>;
