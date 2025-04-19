import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../auth/db";
import { menuItems } from "../menu/db";
import { partners } from "../restaurant/db";

/**
 * Cart items table schema
 * Defines the structure of the cart_items table in the database
 */
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Schema for selecting cart items
 */
export const selectCartItemSchema = createSelectSchema(cartItems);

/**
 * Schema for inserting cart items
 */
export const insertCartItemSchema = createInsertSchema(cartItems);

/**
 * Type for cart item model
 */
export type CartItem = z.infer<typeof selectCartItemSchema>;

/**
 * Type for new cart item model
 */
export type NewCartItem = z.infer<typeof insertCartItemSchema>;

/**
 * Schema for cart item creation
 */
export const createCartItemSchema = z.object({
  userId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  partnerId: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
});

/**
 * Schema for cart item update
 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
});
