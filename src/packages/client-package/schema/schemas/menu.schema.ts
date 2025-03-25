import { z } from "zod";

import { dateSchema } from "../../../../packages/next-portal/src/types/common.schema";
import { categoryResponseSchema } from "./category.schema";

const menuItemBaseSchema = z.object({
  published: z.boolean().default(false),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.number().min(0, "Price must be positive"),
  image: z.string().nullable(),
  taxPercent: z.number().min(0),
  availableFrom: dateSchema.nullable(),
  availableTo: dateSchema.nullable(),
  isAvailable: z.boolean().default(true),
});

export const menuItemCreateSchema = menuItemBaseSchema.extend({
  categoryId: z.string().uuid({ message: "Valid category ID is required" }),
  restaurantId: z.string().uuid({ message: "Valid restaurant ID is required" }),
});
export type MenuItemCreateType = z.infer<typeof menuItemCreateSchema>;

export const menuItemUpdateSchema = menuItemCreateSchema;
export type MenuItemUpdateType = z.infer<typeof menuItemUpdateSchema>;

export const menuItemResponseSchema = menuItemBaseSchema.extend({
  category: categoryResponseSchema,
  restaurantId: z.string().uuid(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type MenuItemResponseType = z.input<typeof menuItemResponseSchema>;

export const menuItemSearchSchema = z.object({
  categoryId: z.string().uuid().nullable(),
  published: z.boolean().nullable(),
  minPrice: z.number().nullable(),
  maxPrice: z.number().nullable(),
  restaurantId: z.string().uuid().nullable(),
});
export type MenuItemSearchType = z.infer<typeof menuItemSearchSchema>;
