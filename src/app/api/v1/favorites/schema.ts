import type { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ResponseType } from "next-vibe/shared/types/response.schema";
import { z } from "zod";

/**
 * Schema for getting user favorites
 */
export const FavoritesGetSchema = z
  .object({
    userId: z.string().optional(),
  })
  .strict();

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
export const FavoriteAddSchema = z
  .object({
    restaurantId: z.string(),
  })
  .strict();

export type FavoriteAddType = z.infer<typeof FavoriteAddSchema>;

/**
 * Schema for removing a favorite
 */
export const FavoriteRemoveSchema = z
  .object({
    restaurantId: z.string(),
  })
  .strict();

export type FavoriteRemoveType = z.infer<typeof FavoriteRemoveSchema>;

/**
 * Combined response type for favorites operations
 */
export type FavoritesResponseSchemaType = ResponseType<FavoritesResponseType>;

/**
 * Combined response type for undefined operations
 */
export type UndefinedResponseType = ResponseType<
  z.infer<typeof undefinedSchema>
>;
