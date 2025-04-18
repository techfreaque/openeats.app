import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

import { Currencies } from "@/translations";

import { categoryResponseSchema } from "./category.schema";

const menuItemBaseSchema = z.object({
  published: z.boolean().default(false),
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  price: z.number().min(0, "Price must be positive"),
  image: z.string().nullable(),
  taxPercent: z.number().min(0),
  currency: z.nativeEnum(Currencies),
  availableFrom: dateSchema.nullable(),
  availableTo: dateSchema.nullable(),
  isAvailable: z.boolean().default(true),
  restaurantId: z.string().uuid({ message: "Valid restaurant ID is required" }),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export const menuItemCreateSchema = menuItemBaseSchema.extend({
  categoryId: z.string().uuid({ message: "Valid category ID is required" }),
});
export type MenuItemCreateType = z.infer<typeof menuItemCreateSchema>;

export const menuItemUpdateSchema = menuItemCreateSchema.extend({
  id: z.string().uuid({ message: "Valid menu item ID is required" }),
});
export type MenuItemUpdateType = z.infer<typeof menuItemUpdateSchema>;

export const menuItemResponseSchema = menuItemUpdateSchema
  .omit({
    categoryId: true,
  })
  .extend({
    category: categoryResponseSchema,
    restaurantId: z.string().uuid(),
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
