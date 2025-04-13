/**
 * Users database schema
 * Defines the structure of the users table
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users table schema
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Schema for selecting users
 */
export const selectUserSchema = createSelectSchema(users);

/**
 * Schema for inserting users
 */
export const insertUserSchema = createInsertSchema(users);

/**
 * Type for user model
 */
export type User = z.infer<typeof selectUserSchema>;

/**
 * Type for new user model
 */
export type NewUser = z.infer<typeof insertUserSchema>;

/**
 * Schema for user creation
 */
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  imageUrl: z.string().optional(),
});

/**
 * Schema for user update
 */
export const updateUserSchema = createUserSchema.partial();
