import {
  boolean,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { countryEnum } from "../drivers/db";

/**
 * Currency enum
 * Defines the possible values for currencies
 */
export const currencyEnum = pgEnum("currency", ["EUR", "CHF"]);

/**
 * Partners (restaurants) table schema
 * Defines the structure of the partners table in the database
 */
export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  street: text("street").notNull(),
  streetNumber: text("street_number").notNull(),
  zip: text("zip").notNull(),
  city: text("city").notNull(),
  country: countryEnum("country").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  currency: currencyEnum("currency").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  isOpen: boolean("is_open").default(false).notNull(),
  imageUrl: text("image_url"),
  rating: numeric("rating").default("0").notNull(),
  ratingRecent: numeric("rating_recent").default("0").notNull(),
  ratingCount: numeric("rating_count").default("0").notNull(),
  deliveryRadius: numeric("delivery_radius").notNull(), // in kilometers
  deliveryFee: numeric("delivery_fee").notNull(),
  minimumOrderAmount: numeric("minimum_order_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertPartnerSchema = createInsertSchema(partners);
export const selectPartnerSchema = createSelectSchema(partners);

// Type definitions
export type Partner = z.infer<typeof selectPartnerSchema>;
export type NewPartner = z.infer<typeof insertPartnerSchema>;
