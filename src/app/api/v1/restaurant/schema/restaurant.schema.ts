import { dateSchema } from "next-vibe/shared/types/common.schema";
import {
  userRoleRestaurantCreateSchema,
  userRoleRestaurantResponseSchema,
} from "next-vibe/shared/types/user-roles.schema";
import { z } from "zod";

import { Countries } from "@/translations";

import { categoryResponseSchema } from "./category.schema";
import { menuItemResponseSchema } from "./menu.schema";
import { openingTimesResponseSchema } from "./opening-times.schema";

const restaurantBaseSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Restaurant name must be at least 2 characters long" }),
  description: z.string(),
  street: z.string().min(1, { message: "Street is required" }),
  streetNumber: z.string().min(1, { message: "Street number is required" }),
  zip: z.string().min(1, { message: "ZIP code is required" }),
  city: z.string().min(1, { message: "City is required" }),
  phone: z
    .string()
    .min(5, { message: "Phone number must be at least 5 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  image: z.string({ message: "Image must be a valid URL" }),
  published: z.boolean(),
  delivery: z.boolean(),
  pickup: z.boolean(),
  dineIn: z.boolean(),
  priceLevel: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === "string") {
        return parseInt(val, 10);
      }
      return val;
    })
    .refine((val) => val >= 0 && val <= 4 && Number.isInteger(val), {
      message: "Price level must be an integer between 0 and 4",
    }),
});

export const restaurantCreateSchema = restaurantBaseSchema
  .omit({
    published: true,
  })
  .extend({
    countryId: z.nativeEnum(Countries, {
      message: "Valid country ID is required",
    }),
    mainCategoryId: z
      .string()
      .uuid({ message: "Valid category ID is required" }),
    userRoles: z.array(userRoleRestaurantCreateSchema),
  });
export type RestaurantCreateType = z.input<typeof restaurantCreateSchema>;

export const restaurantUpdateSchema = restaurantCreateSchema.extend({
  countryId: z.nativeEnum(Countries, {
    message: "Valid country ID is required",
  }),
  mainCategoryId: z.string().uuid({ message: "Valid category ID is required" }),
  id: z.string().uuid(),
  published: z.boolean(),
});
export type RestaurantUpdateType = z.infer<typeof restaurantUpdateSchema>;

export const restaurantGetSchema = z.object({
  restaurantId: z.string(),
});
export type RestaurantGetType = z.infer<typeof restaurantGetSchema>;

export const restaurantResponseSchema = restaurantBaseSchema.extend({
  id: z.string().uuid(),
  orderCount: z.number(),
  rating: z.number().min(0).max(5),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  countryId: z.nativeEnum(Countries, {
    message: "Valid country ID is required",
  }),
  mainCategory: categoryResponseSchema,
  menuItems: z.array(menuItemResponseSchema.omit({ restaurantId: true })),
  userRoles: z.array(userRoleRestaurantResponseSchema).optional(),
  openingTimes: openingTimesResponseSchema,
  verified: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
});
export type RestaurantResponseType = z.input<typeof restaurantResponseSchema>;

export const restaurantPrivateResponseSchema = restaurantResponseSchema.extend({
  userRoles: z.array(userRoleRestaurantResponseSchema),
});
export type RestaurantPrivateResponseType = z.infer<
  typeof restaurantPrivateResponseSchema
>;

export const restaurantProfileMinimalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, { message: "Restaurant name is required" }),
  image: z.string().nullable(),
});
export type RestaurantProfileMinimalType = z.infer<
  typeof restaurantProfileMinimalSchema
>;

export const restaurantSearchSchema = z.object({
  name: z.string().optional(),
  city: z.string().optional(),
  countryId: z.nativeEnum(Countries).optional(),
  published: z.boolean().optional(),
});
export type RestaurantSearchType = z.infer<typeof restaurantSearchSchema>;
