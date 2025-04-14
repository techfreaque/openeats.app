import { z } from "zod";

import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { ResponseType } from "next-vibe/shared/types/response.schema";

/**
 * Schema for getting user favorites
 */
export const FavoritesGetSchema = z.object({
  userId: z.string().optional(),
}).strict();

export type FavoritesGetType = z.infer<typeof FavoritesGetSchema>;

/**
 * Schema for favorites response
 */
export const FavoritesResponseSchema = z.object({
  favorites: z.array(z.string()),
});

export type FavoritesResponseType = z.infer<typeof FavoritesResponseSchema>;

/**
 * Schema for adding a favorite
 */
export const FavoriteAddSchema = z.object({
  restaurantId: z.string(),
});

export type FavoriteAddType = z.infer<typeof FavoriteAddSchema>;

/**
 * Schema for removing a favorite
 */
export const FavoriteRemoveSchema = z.object({
  restaurantId: z.string(),
});

export type FavoriteRemoveType = z.infer<typeof FavoriteRemoveSchema>;

/**
 * Combined response type for favorites operations
 */
export type FavoritesResponseSchemaType = ResponseType<FavoritesResponseType>;

/**
 * Combined response type for undefined operations
 */
export type UndefinedResponseType = ResponseType<z.infer<typeof undefinedSchema>>;
