/**
 * Favorites database schema
 * This file defines the database schema for favorites
 */

import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/me/users.db";
import { partners } from "../restaurant/db";

/**
 * Favorites table schema
 */
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Favorite schema for database operations
 */
export const selectFavoriteSchema = createSelectSchema(favorites);

export const insertFavoriteSchema = createInsertSchema(favorites);

export type NewFavoriteInput = Omit<
  z.infer<typeof insertFavoriteSchema>,
  "id" | "createdAt"
>;

/**
 * Favorite types for database operations
 */
export type Favorite = z.infer<typeof selectFavoriteSchema>;
export type NewFavorite = z.infer<typeof insertFavoriteSchema>;
