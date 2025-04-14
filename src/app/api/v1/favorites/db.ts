/**
 * Favorites database schema
 * This file defines the database schema for favorites
 */

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../auth/me/db";
import { partners } from "../restaurant/db";

/**
 * Favorites table schema
 */
export const favorites = pgTable("favorites", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  restaurantId: text("restaurantId")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Favorite schema for database operations
 */
export const selectFavoriteSchema = createSelectSchema(favorites);
export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

/**
 * Favorite types for database operations
 */
export type Favorite = z.infer<typeof selectFavoriteSchema>;
export type NewFavorite = z.infer<typeof insertFavoriteSchema>;
