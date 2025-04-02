import { z } from "zod";

import { restaurantResponseSchema } from "../restaurant/schema/restaurant.schema";

export const restaurantsSearchSchema = z.object({
  search: z.string().min(2).nullable().optional(),
  countryCode: z.string().length(2),
  zip: z.string().min(1),
  street: z.string().min(1).optional().nullable(),
  streetNumber: z.string().min(1).optional().nullable(),
  radius: z.number().max(50).default(10),
  rating: z.number().min(0).max(5).optional().nullable(),
  currentlyOpen: z.boolean().optional().nullable(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(100),

  // Add new filter options
  category: z.string().optional().nullable(),
  deliveryType: z
    .enum(["delivery", "pickup", "all"])
    .optional()
    .default("delivery"),
  priceRange: z.array(z.string()).optional().nullable(),
  dietary: z.array(z.string()).optional().nullable(),
  sortBy: z
    .enum(["relevance", "rating", "delivery-time", "price-low", "price-high"])
    .optional()
    .default("relevance"),
});
export type RestaurantsSearchType = z.input<typeof restaurantsSearchSchema>;

export const restaurantsResponseSchema = z.object({
  restaurants: z.array(restaurantResponseSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
});
export type RestaurantsResponseType = z.input<typeof restaurantsResponseSchema>;
