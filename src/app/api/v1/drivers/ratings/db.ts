import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../../auth/db";
import { orders } from "../../order/db";
import { drivers } from "../db";

/**
 * Driver ratings table schema
 * Defines the structure of the driver_ratings table in the database
 */
export const driverRatings = pgTable("driver_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => drivers.id),
  orderId: uuid("order_id").references(() => orders.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertDriverRatingSchema = createInsertSchema(driverRatings);
export const selectDriverRatingSchema = createSelectSchema(driverRatings);

// Type definitions
export type DriverRating = z.infer<typeof selectDriverRatingSchema>;
export type NewDriverRating = z.infer<typeof insertDriverRatingSchema>;
