import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

/**
 * Cart API schemas
 * This file contains all the schemas used in the cart API
 */

/**
 * Schema for creating a cart item
 */
export const cartItemCreateSchema = z.object({
  menuItemId: z.string().uuid({ message: "Valid menu item ID is required" }),
  restaurantId: z.string().uuid({ message: "Valid restaurant ID is required" }),
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  specialInstructions: z.string().nullable().optional(),
});

/**
 * Schema for updating a cart item
 */
export const cartItemUpdateSchema = z.object({
  id: z.string().uuid({ message: "Valid cart item ID is required" }),
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  specialInstructions: z.string().nullable().optional(),
});

/**
 * Schema for cart item URL parameters
 */
export const cartItemUrlParamsSchema = z.object({
  id: z.string().uuid({ message: "Valid cart item ID is required" }),
});

/**
 * Schema for cart item response
 */
export const cartItemResponseSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  partnerId: z.string().uuid(),
  userId: z.string().uuid(),
  quantity: z.number(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

/**
 * Schema for cart response (array of cart items)
 */
export const cartResponseSchema = z.array(cartItemResponseSchema);

// Export types for use in hooks and other files
export type CartItemCreateType = z.infer<typeof cartItemCreateSchema>;
export type CartItemUpdateType = z.infer<typeof cartItemUpdateSchema>;
export type CartItemUrlParamsType = z.infer<typeof cartItemUrlParamsSchema>;
export type CartItemResponseType = z.infer<typeof cartItemResponseSchema>;
export type CartResponseType = z.infer<typeof cartResponseSchema>;
