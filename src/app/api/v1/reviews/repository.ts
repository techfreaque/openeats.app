import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Repository } from "next-vibe/server/db/repository";

import { db } from "@/app/api/db";

import {
  type NewReview,
  type NewReviewInput,
  type Review,
  reviews,
} from "./db";

/**
 * Repository for reviews
 */
export class ReviewRepository extends Repository<
  typeof reviews,
  Review,
  NewReview
> {
  constructor() {
    super(db, reviews);
  }

  /**
   * Create a new review
   * @param data Review data
   * @returns Created review
   */
  async createReview(data: NewReviewInput): Promise<Review> {
    const newReview: NewReview = {
      ...data,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.create(newReview);
  }

  /**
   * Get all reviews for a restaurant
   * @param restaurantId Restaurant ID
   * @returns Reviews for the restaurant
   */
  async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    return this.findMany({
      where: eq(reviews.restaurantId, restaurantId),
    });
  }

  /**
   * Get all reviews by a user
   * @param userId User ID
   * @returns Reviews by the user
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    return this.findMany({
      where: eq(reviews.userId, userId),
    });
  }

  /**
   * Get a review by ID and user ID
   * @param id Review ID
   * @param userId User ID
   * @returns Review if found, null otherwise
   */
  async getUserReview(id: string, userId: string): Promise<Review | null> {
    const result = await this.findMany({
      where: and(eq(reviews.id, id), eq(reviews.userId, userId)),
    });

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Update a review
   * @param id Review ID
   * @param data Review data to update
   * @returns Updated review
   */
  async updateReview(id: string, data: Partial<Review>): Promise<Review> {
    return this.update(id, {
      ...data,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a review
   * @param id Review ID
   * @returns True if deleted, false otherwise
   */
  async deleteReview(id: string): Promise<boolean> {
    await this.delete(id);
    return true;
  }
}

export const reviewRepository = new ReviewRepository();
