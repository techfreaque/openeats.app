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

import { categories } from "../category/db";
import { currencyEnum, partners } from "../restaurant/db";

/**
 * Menu items table schema
 * Defines the structure of the menu_items table in the database
 */
export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  currency: currencyEnum("currency").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true).notNull(),
  published: boolean("published").default(false).notNull(),
  taxPercent: numeric("tax_percent").default("0").notNull(),
  availableFrom: timestamp("available_from"),
  availableTo: timestamp("available_to"),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertMenuItemSchema = createInsertSchema(menuItems);
export const selectMenuItemSchema = createSelectSchema(menuItems);

// Type definitions
export type MenuItem = z.infer<typeof selectMenuItemSchema>;
export type NewMenuItem = z.infer<typeof insertMenuItemSchema>;
