/**
 * Delivery database schema
 * Defines the structure of the deliveries table
 */

import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { drivers } from "../drivers/drivers.db";
import { orders } from "./order.db";

/**
 * Delivery type enum
 * Defines the possible values for delivery types
 */
export const deliveryTypeEnum = pgEnum("delivery_type", [
  "PICKUP",
  "DELIVERY",
  "DINE_IN",
  "ALL",
]);

/**
 * Delivery status enum
 * Defines the possible values for delivery statuses
 */
export const deliveryStatusEnum = pgEnum("delivery_status", [
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
]);

/**
 * Deliveries table schema
 */
export const deliveries = pgTable("deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id)
    .unique(),
  driverId: uuid("driver_id").references(() => drivers.id),
  type: deliveryTypeEnum("type").notNull(),
  status: deliveryStatusEnum("status").notNull().default("ASSIGNED"),
  message: text("message"),
  estimatedDeliveryTime: integer("estimated_delivery_time"), // in minutes
  estimatedPreparationTime: integer("estimated_preparation_time").notNull(), // in minutes
  distance: numeric("distance"), // in kilometers
  street: text("street"),
  streetNumber: text("street_number"),
  zip: text("zip"),
  city: text("city"),
  phone: text("phone"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  countryId: text("country_id"),
  estimatedDelivery: timestamp("estimated_delivery"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Schema for selecting deliveries
 */
export const selectDeliverySchema = createSelectSchema(deliveries);

/**
 * Schema for inserting deliveries
 */
export const insertDeliverySchema = createInsertSchema(deliveries);

/**
 * Type for delivery model
 */
export type Delivery = z.infer<typeof selectDeliverySchema>;

/**
 * Type for new delivery model
 */
export type NewDelivery = z.infer<typeof insertDeliverySchema>;

/**
 * Schema for delivery creation
 */
export const createDeliverySchema = z.object({
  orderId: z.string().uuid(),
  driverId: z.string().uuid().nullable().optional(),
  type: z.enum(["PICKUP", "DELIVERY", "DINE_IN", "ALL"]),
  status: z.enum(["ASSIGNED", "PICKED_UP", "DELIVERED"]).default("ASSIGNED"),
  message: z.string().nullable().optional(),
  estimatedDeliveryTime: z.number().int().nullable().optional(),
  estimatedPreparationTime: z.number().int(),
  distance: z.number().positive().nullable().optional(),
  street: z.string().nullable().optional(),
  streetNumber: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  countryId: z.string().nullable().optional(),
});

/**
 * Schema for delivery update
 */
export const updateDeliverySchema = z.object({
  status: z.enum(["ASSIGNED", "PICKED_UP", "DELIVERED"]),
  driverId: z.string().uuid().nullable().optional(),
  estimatedDelivery: z.date().nullable().optional(),
  deliveredAt: z.date().nullable().optional(),
  estimatedDeliveryTime: z.number().int().nullable().optional(),
});
