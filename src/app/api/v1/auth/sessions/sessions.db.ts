/**
 * Sessions database schema
 * Defines the structure of the sessions table
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../me/users.db";

/**
 * Sessions table schema
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Schema for selecting sessions
 */
export const selectSessionSchema = createSelectSchema(sessions);

/**
 * Schema for inserting sessions
 */
export const insertSessionSchema = createInsertSchema(sessions);

/**
 * Type for session model
 */
export type Session = z.infer<typeof selectSessionSchema>;

/**
 * Type for new session model
 */
export type NewSession = z.infer<typeof insertSessionSchema>;

/**
 * Schema for session creation
 */
export const createSessionSchema = z.object({
  userId: z.string().uuid(),
  token: z.string(),
  expiresAt: z.date(),
});
