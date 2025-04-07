import { z } from "zod";

import { Countries } from "@/translations";

import { DeliveryType } from "../order/delivery.schema";
import { restaurantResponseSchema } from "../restaurant/schema/restaurant.schema";

export const restaurantsSearchSchema = z.object({
  search: z.string().min(2).nullable().optional(),
  countryCode: z.nativeEnum(Countries).default(Countries.DE),
  zip: z.string().min(1).optional().nullable(),
  street: z.string().min(1).optional().nullable(),
  streetNumber: z.string().min(1).optional().nullable(),
  radius: z.number().max(50).default(10).optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  currentlyOpen: z.boolean().optional().nullable(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(100),

  // Add new filter options
  category: z.string().optional().nullable(),
  deliveryType: z.nativeEnum(DeliveryType).optional().default(DeliveryType.ALL),
  priceRange: z.array(z.string()).optional().nullable(),
  dietary: z.array(z.string()).optional().nullable(),
  sortBy: z
    .enum(["relevance", "rating", "delivery-time", "price-low", "price-high"])
    .optional()
    .default("relevance"),
});
export type RestaurantsSearchType = z.input<typeof restaurantsSearchSchema>;
export type RestaurantsSearchOutputType = z.infer<
  typeof restaurantsSearchSchema
>;

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
