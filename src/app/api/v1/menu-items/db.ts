import { relations } from "drizzle-orm";
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { categories } from "../category/db";
import { partners } from "../restaurant/db";

/**
 * Menu items table
 */
export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  currency: text("currency").notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  published: boolean("published").notNull().default(false),
  taxPercent: numeric("tax_percent").notNull().default("0"),
  availableFrom: timestamp("available_from"),
  availableTo: timestamp("available_to"),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Menu items relations
 */
export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  partner: one(partners, {
    fields: [menuItems.partnerId],
    references: [partners.id],
  }),
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));
