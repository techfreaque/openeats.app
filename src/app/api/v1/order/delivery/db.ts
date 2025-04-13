import { integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { addresses } from "../../addresses/db";
import { drivers } from "../../drivers/db";
import { orders } from "../db";

/**
 * Delivery type enum
 * Defines the possible values for delivery types
 */
export const deliveryTypeEnum = pgEnum("delivery_type", ["PICKUP", "DELIVERY"]);

/**
 * Delivery status enum
 * Defines the possible values for delivery status
 */
export const deliveryStatusEnum = pgEnum("delivery_status", [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "CANCELLED",
]);

/**
 * Deliveries table schema
 * Defines the structure of the deliveries table in the database
 */
export const deliveries = pgTable("deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id)
    .unique(),
  driverId: uuid("driver_id").references(() => drivers.id),
  addressId: uuid("address_id").references(() => addresses.id),
  type: deliveryTypeEnum("type").notNull(),
  status: deliveryStatusEnum("status").default("PENDING").notNull(),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  estimatedTime: integer("estimated_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertDeliverySchema = createInsertSchema(deliveries);
export const selectDeliverySchema = createSelectSchema(deliveries);

// Type definitions
export type Delivery = z.infer<typeof selectDeliverySchema>;
export type NewDelivery = z.infer<typeof insertDeliverySchema>;
