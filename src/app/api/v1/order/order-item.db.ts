/**
 * Order item database schema
 * Defines the structure of the order_items table
 */

import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { menuItems } from "../menu/db";
import { orders } from "./order.db";

/**
 * Order items table schema
 */
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
  taxPercent: numeric("tax_percent").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Schema for selecting order items
 */
export const selectOrderItemSchema = createSelectSchema(orderItems);

/**
 * Schema for inserting order items
 */
export const insertOrderItemSchema = createInsertSchema(orderItems);

/**
 * Type for order item model
 */
export type OrderItem = z.infer<typeof selectOrderItemSchema>;

/**
 * Type for new order item model
 */
export type NewOrderItem = z.infer<typeof insertOrderItemSchema>;

/**
 * Schema for order item creation
 */
export const createOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  taxPercent: z.number().nonnegative(),
  message: z.string().nullable().optional(),
});

/**
 * Schema for order item update
 */
export const updateOrderItemSchema = z.object({
  quantity: z.number().int().positive(),
  message: z.string().nullable().optional(),
});
