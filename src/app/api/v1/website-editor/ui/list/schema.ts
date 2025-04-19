import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

// Schema for listing UI components
export const listUisRequestSchema = z.object({
  mode: z.enum(["latest", "most_liked", "most_viewed"]).default("latest"),
  start: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().default(10),
  timeRange: z.enum(["1h", "24h", "7d", "30d", "all"]).default("all"),
});
export type ListUisRequestType = z.infer<typeof listUisRequestSchema>;

// Schema for user response
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  imageUrl: z.string().nullable().optional(),
});
export type UserResponseType = z.infer<typeof userResponseSchema>;

// Schema for UI response
export const uiResponseSchema = z.object({
  id: z.string().uuid(),
  uiType: z.string(),
  user: userResponseSchema,
  prompt: z.string(),
  public: z.boolean(),
  img: z.string(),
  viewCount: z.number().int(),
  likesCount: z.number().int(),
  forkedFrom: z.string().uuid().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type UiResponseType = z.infer<typeof uiResponseSchema>;

// Schema for list UIs response
export const listUisResponseSchema = z.object({
  uis: z.array(uiResponseSchema),
});
export type ListUisResponseType = z.infer<typeof listUisResponseSchema>;
