import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../../auth/db";
import { orders } from "../../order/db";
import { partners } from "../db";

/**
 * Restaurant ratings table schema
 * Defines the structure of the restaurant_ratings table in the database
 */
export const restaurantRatings = pgTable("restaurant_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => partners.id),
  orderId: uuid("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertRestaurantRatingSchema =
  createInsertSchema(restaurantRatings);
export const selectRestaurantRatingSchema =
  createSelectSchema(restaurantRatings);

// Type definitions
export type RestaurantRating = z.infer<typeof selectRestaurantRatingSchema>;
export type NewRestaurantRating = z.infer<typeof insertRestaurantRatingSchema>;
