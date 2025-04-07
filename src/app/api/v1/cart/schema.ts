import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

import { menuItemResponseSchema } from "../restaurant/schema/menu.schema";
import { restaurantProfileMinimalSchema } from "../restaurant/schema/restaurant.schema";

const cartItemBaseSchema = z.object({});

export const cartUpdateSchema = z.array(
  cartItemBaseSchema.extend({
    id: z.string().uuid().optional().nullable(),
    menuItemId: z.string().uuid(),
    restaurantId: z.string().uuid(),
    quantity: z.number().min(0, { message: "Quantity must be at least 1" }),
  }),
);
export type CartUpdateType = z.input<typeof cartUpdateSchema>;

export const cartItemResponseSchema = cartItemBaseSchema.extend({
  id: z.string().uuid(),
  menuItem: menuItemResponseSchema,
  restaurant: restaurantProfileMinimalSchema,
  createdAt: dateSchema,
  updatedAt: dateSchema,
  quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
});
export type CartItemResponseType = z.input<typeof cartItemResponseSchema>;

export const cartResponseSchema = z.array(
  cartItemBaseSchema.extend({
    id: z.string().uuid(),
    menuItem: menuItemResponseSchema,
    restaurant: restaurantProfileMinimalSchema,
    createdAt: dateSchema,
    updatedAt: dateSchema,
    quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  }),
);
export type CartResponseType = z.input<typeof cartResponseSchema>;
