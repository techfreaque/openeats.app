/**
 * Password reset database schema
 * Defines the structure of the password_resets table
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../../me/users.db";

/**
 * Password resets table schema
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

/**
 * Schema for selecting password resets
 */
export const selectPasswordResetSchema = createSelectSchema(passwordResets);

/**
 * Schema for inserting password resets
 */
export const insertPasswordResetSchema = createInsertSchema(passwordResets);

/**
 * Type for password reset model
 */
export type PasswordReset = z.infer<typeof selectPasswordResetSchema>;

/**
 * Type for new password reset model
 */
export type NewPasswordReset = z.infer<typeof insertPasswordResetSchema>;

/**
 * Schema for password reset creation
 */
export const createPasswordResetSchema = z.object({
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.date(),
});

/**
 * Schema for password reset request
 */
export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

/**
 * Schema for password reset confirmation
 */
export const passwordResetConfirmSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});
