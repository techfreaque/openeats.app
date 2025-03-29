import { z } from "zod";

import { menuItemResponseSchema } from "@/app/api/v1/restaurant/schema/menu.schema";
import { restaurantProfileMinimalSchema } from "@/app/api/v1/restaurant/schema/restaurant.schema";

const cartItemBaseSchema = z.object({
  quantity: z.number().int().min(0),
  userId: z.string().uuid(),
});

export const cartItemUpdateSchema = cartItemBaseSchema.extend({
  menuItemId: z.string().uuid(),
  restaurantId: z.string().uuid(),
});
export type CartItemUpdateType = z.infer<typeof cartItemUpdateSchema>;

export const cartItemResponseSchema = cartItemBaseSchema.extend({
  menuItem: menuItemResponseSchema,
  restaurant: restaurantProfileMinimalSchema,
});
export type CartItemResponseType = z.input<typeof cartItemResponseSchema>;

export const cartItemsResponseSchema = z.array(cartItemResponseSchema);
export type CartItemsResponseType = z.input<typeof cartItemsResponseSchema>;
