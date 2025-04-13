import { integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { menuItems } from "../../menu/db";
import { currencyEnum } from "../../restaurant/db";
import { orders } from "../db";

/**
 * Order items table schema
 * Defines the structure of the order_items table in the database
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
  currency: currencyEnum("currency").notNull(),
  message: text("message"),
});

// Schemas for validation with Zod
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const selectOrderItemSchema = createSelectSchema(orderItems);

// Type definitions
export type OrderItem = z.infer<typeof selectOrderItemSchema>;
export type NewOrderItem = z.infer<typeof insertOrderItemSchema>;
