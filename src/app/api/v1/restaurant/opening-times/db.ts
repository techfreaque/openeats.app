import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { partners } from "../db";

/**
 * Day enum
 * Defines the possible values for days of the week
 */
export const dayEnum = pgEnum("day", [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

/**
 * Opening times table schema
 * Defines the structure of the opening_times table in the database
 */
export const openingTimes = pgTable("opening_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id),
  day: dayEnum("day").notNull(),
  open: integer("open").notNull(), // seconds from midnight
  close: integer("close").notNull(), // seconds from midnight
  published: boolean("published").default(false).notNull(),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertOpeningTimeSchema = createInsertSchema(openingTimes);
export const selectOpeningTimeSchema = createSelectSchema(openingTimes);

// Type definitions
export type OpeningTime = z.infer<typeof selectOpeningTimeSchema>;
export type NewOpeningTime = z.infer<typeof insertOpeningTimeSchema>;
