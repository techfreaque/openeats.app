/**
 * Reviews database schema
 * This file defines the database schema for reviews
 */

import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/me/db";
import { partners } from "../restaurant/db";

/**
 * Product review type for database
 */
export interface ProductReviewDb {
  productId: string;
  productName: string;
  rating: number;
  comment?: string;
}

/**
 * Reviews table schema
 */
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  restaurantId: text("restaurantId")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  restaurantRating: integer("restaurantRating").notNull(),
  restaurantComment: text("restaurantComment"),
  productReviews: jsonb("productReviews")
    .$type<ProductReviewDb[]>()
    .default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/**
 * Review schema for database operations
 */
export const selectReviewSchema = createSelectSchema(reviews);

export const insertReviewSchema = createInsertSchema(reviews);

export type NewReviewInput = Omit<
  z.infer<typeof insertReviewSchema>,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Review types for database operations
 */
export type Review = z.infer<typeof selectReviewSchema>;
export type NewReview = z.infer<typeof insertReviewSchema>;
