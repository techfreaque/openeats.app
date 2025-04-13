/**
 * Order database schema
 * Defines the structure of the orders table
 */

import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../auth/me/users.db";
import { partners } from "../restaurant/db";

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
 * Order status enum
 * Defines the possible values for order statuses
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
 * Orders table schema
 */
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => users.id),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => partners.id),
  status: orderStatusEnum("status").notNull().default("NEW"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  message: text("message"),
  total: numeric("total").notNull(),
  deliveryFee: numeric("delivery_fee").notNull(),
  driverTip: numeric("driver_tip"),
  restaurantTip: numeric("restaurant_tip"),
  projectTip: numeric("project_tip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Schema for selecting orders
 */
export const selectOrderSchema = createSelectSchema(orders);

/**
 * Schema for inserting orders
 */
export const insertOrderSchema = createInsertSchema(orders);

/**
 * Type for order model
 */
export type Order = z.infer<typeof selectOrderSchema>;

/**
 * Type for new order model
 */
export type NewOrder = z.infer<typeof insertOrderSchema>;

/**
 * Schema for order creation
 */
export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  paymentMethod: z.enum(["CARD", "CASH", "ONLINE"]),
  message: z.string().nullable().optional(),
  total: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  driverTip: z.number().nonnegative().nullable().optional(),
  restaurantTip: z.number().nonnegative().nullable().optional(),
  projectTip: z.number().nonnegative().nullable().optional(),
});

/**
 * Schema for order update
 */
export const updateOrderSchema = z.object({
  status: z.enum([
    "NEW",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
  message: z.string().nullable().optional(),
});
