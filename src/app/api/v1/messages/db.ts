import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/db";
import { drivers } from "../drivers/db";
import { driverRatings } from "../drivers/ratings/db";
import { earnings } from "../earnings/db";
import { menuItems } from "../menu/db";
import { orders } from "../order/db";
import { partners } from "../restaurant/db";
import { restaurantRatings } from "../restaurant/ratings/db";

/**
 * Message type enum
 * Defines the possible values for message types
 */
export const messageTypeEnum = pgEnum("message_type", [
  "SYSTEM",
  "USER",
  "DRIVER",
  "RESTAURANT",
  "ORDER",
  "RATING",
  "EARNING",
]);

/**
 * Messages table schema
 * Defines the structure of the messages table in the database
 */
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: messageTypeEnum("type").notNull(),
  content: text("content"),
  userId: uuid("user_id").references(() => users.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  restaurantId: uuid("restaurant_id").references(() => partners.id),
  restaurantRatingId: uuid("restaurant_rating_id").references(
    () => restaurantRatings.id,
  ),
  driverRatingId: uuid("driver_rating_id").references(() => driverRatings.id),
  menuItemId: uuid("menu_item_id").references(() => menuItems.id),
  orderId: uuid("order_id").references(() => orders.id),
  earningId: uuid("earning_id").references(() => earnings.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);

// Type definitions
export type Message = z.infer<typeof selectMessageSchema>;
export type NewMessage = z.infer<typeof insertMessageSchema>;
