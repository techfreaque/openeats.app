import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/db";
import { countryEnum } from "../drivers/db";

/**
 * Addresses table schema
 * Defines the structure of the addresses table in the database
 */
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  street: text("street").notNull(),
  streetNumber: text("street_number").notNull(),
  zip: text("zip").notNull(),
  city: text("city").notNull(),
  country: countryEnum("country").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertAddressSchema = createInsertSchema(addresses);
export const selectAddressSchema = createSelectSchema(addresses);

// Type definitions
export type Address = z.infer<typeof selectAddressSchema>;
export type NewAddress = z.infer<typeof insertAddressSchema>;
