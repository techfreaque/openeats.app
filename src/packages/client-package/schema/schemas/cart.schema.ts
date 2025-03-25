import { z } from "zod";

import { restaurantProfileMinimalSchema } from "../api/v1/restaurant/restaurant.schema";
import { menuItemResponseSchema } from "./menu.schema";

const cartItemBaseSchema = z.object({
  quantity: z.number().int().min(0),
  userId: z.string().uuid(),
});

export const cartItemUpdateSchema = cartItemBaseSchema.extend({
  menuItemId: z.string().uuid(),
  restaurantId: z.string().uuid(),
});

export const cartItemResponseSchema = cartItemBaseSchema.extend({
  menuItem: menuItemResponseSchema,
  restaurant: restaurantProfileMinimalSchema,
});

export const cartItemsResponseSchema = z.array(cartItemResponseSchema);
