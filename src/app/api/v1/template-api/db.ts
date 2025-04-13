import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

/**
 * Template table schema
 * This is a reference implementation for database tables
 */
export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  someValue: text("some_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertTemplateSchema = createInsertSchema(templates);
export const selectTemplateSchema = createSelectSchema(templates);

// Type definitions
export type Template = z.infer<typeof selectTemplateSchema>;
export type NewTemplate = z.infer<typeof insertTemplateSchema>;
