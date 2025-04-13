import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../../me/db";

/**
 * Password resets table schema
 * Defines the structure of the password_resets table in the database
 */
export const passwordResets = pgTable("password_resets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id)
    .unique(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertPasswordResetSchema = createInsertSchema(passwordResets);
export const selectPasswordResetSchema = createSelectSchema(passwordResets);

// Type definitions
export type PasswordReset = z.infer<typeof selectPasswordResetSchema>;
export type NewPasswordReset = z.infer<typeof insertPasswordResetSchema>;
