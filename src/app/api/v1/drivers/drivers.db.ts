/**
 * Drivers database schema
 * Defines the structure of the drivers table
 */

import {
  boolean,
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

import { users } from "../auth/me/users.db";

/**
 * Country enum
 * Defines the possible values for countries
 */
export const countryEnum = pgEnum("country", ["DE", "AT", "CH"]);

/**
 * Drivers table schema
 */
export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  isActive: boolean("is_active").default(true).notNull(),
  vehicle: text("vehicle").notNull(),
  licensePlate: text("license_plate").notNull(),
  radius: numeric("radius").notNull(), // in kilometers
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  phone: text("phone").notNull(),
  street: text("street").notNull(),
  streetNumber: text("street_number").notNull(),
  zip: text("zip").notNull(),
  city: text("city").notNull(),
  countryId: countryEnum("country_id").notNull(),
  rating: numeric("rating").default("0").notNull(),
  ratingRecent: numeric("rating_recent").default("0").notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Schema for selecting drivers
 */
export const selectDriverSchema = createSelectSchema(drivers);

/**
 * Schema for inserting drivers
 */
export const insertDriverSchema = createInsertSchema(drivers);

/**
 * Type for driver model
 */
export type Driver = z.infer<typeof selectDriverSchema>;

/**
 * Type for new driver model
 */
export type NewDriver = z.infer<typeof insertDriverSchema>;

/**
 * Schema for driver creation
 */
export const createDriverSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean().default(true),
  vehicle: z.string(),
  licensePlate: z.string(),
  radius: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  zip: z.string(),
  city: z.string(),
  countryId: z.enum(["DE", "AT", "CH"]),
});
