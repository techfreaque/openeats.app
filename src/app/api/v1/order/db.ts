import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/me/users.db";
import { currencyEnum, partners } from "../restaurant/db";

/**
 * Order status enum
 * Defines the possible values for order status
 */
export const orderStatusEnum = pgEnum("order_status", [
  "NEW",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

/**
 * Payment method enum
 * Defines the possible values for payment methods
 */
export const paymentMethodEnum = pgEnum("payment_method", [
  "CARD",
  "CASH",
  "ONLINE",
]);

/**
 * Orders table schema
 * Defines the structure of the orders table in the database
 */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  message: text("message"),
  status: orderStatusEnum("status").default("NEW").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  tax: numeric("tax").notNull(),
  currency: currencyEnum("currency").notNull(),
  total: numeric("total").notNull(),
  deliveryFee: numeric("delivery_fee").notNull(),
  driverTip: numeric("driver_tip"),
  restaurantTip: numeric("restaurant_tip"),
  projectTip: numeric("project_tip"),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => users.id),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => partners.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);

// Type definitions
export type Order = z.infer<typeof selectOrderSchema>;
export type NewOrder = z.infer<typeof insertOrderSchema>;
