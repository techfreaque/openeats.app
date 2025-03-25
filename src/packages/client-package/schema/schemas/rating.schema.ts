import { z } from "zod";

export const restaurantRatingCreateSchema = z.object({
  rating: z.number().min(1).max(5),
  restaurantId: z.string().uuid({ message: "Valid restaurant ID is required" }),
});
export type RestaurantRatingCreateType = z.infer<
  typeof restaurantRatingCreateSchema
>;

export const driverRatingCreateSchema = z.object({
  rating: z.number().min(1).max(5),
  ratedUserId: z.string().uuid({ message: "Valid driver ID is required" }),
});
