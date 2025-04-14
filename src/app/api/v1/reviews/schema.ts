import { z } from "zod";

import { dateSchema } from "next-vibe/shared/types/common.schema";
import { ResponseType } from "next-vibe/shared/types/response.schema";

/**
 * Product review schema
 */
export const productReviewSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type ProductReviewType = z.infer<typeof productReviewSchema>;

/**
 * Review schema for creating a new review
 */
export const reviewCreateSchema = z.object({
  restaurantId: z.string(),
  restaurantRating: z.number().min(1).max(5),
  restaurantComment: z.string().optional(),
  productReviews: z.array(productReviewSchema).optional(),
});

export type ReviewCreateType = z.infer<typeof reviewCreateSchema>;

/**
 * Review schema for updating an existing review
 */
export const reviewUpdateSchema = z.object({
  restaurantRating: z.number().min(1).max(5).optional(),
  restaurantComment: z.string().optional(),
  productReviews: z.array(productReviewSchema).optional(),
});

export type ReviewUpdateType = z.infer<typeof reviewUpdateSchema>;

/**
 * Review response schema
 */
export const reviewResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  userAvatar: z.string().optional(),
  restaurantId: z.string(),
  restaurantRating: z.number().min(1).max(5),
  restaurantComment: z.string().optional(),
  productReviews: z.array(productReviewSchema),
  date: dateSchema,
});

export type ReviewResponseType = z.infer<typeof reviewResponseSchema>;

/**
 * Reviews response schema (array of reviews)
 */
export const reviewsResponseSchema = z.array(reviewResponseSchema);
export type ReviewsResponseType = z.infer<typeof reviewsResponseSchema>;

/**
 * Combined response type for reviews operations
 */
export type ReviewsResponseSchemaType = ResponseType<ReviewsResponseType>;
export type ReviewResponseSchemaType = ResponseType<ReviewResponseType>;
