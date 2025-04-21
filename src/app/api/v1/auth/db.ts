/**
 * Auth database schema
 * Defines the structure of auth-related tables
 */

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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

/**
 * User role enum
 * Defines the possible values for user roles
 */
export enum UserRoleValue {
  PUBLIC = "PUBLIC",
  CUSTOMER = "CUSTOMER",
  PARTNER_ADMIN = "PARTNER_ADMIN",
  PARTNER_EMPLOYEE = "PARTNER_EMPLOYEE",
  COURIER = "COURIER",
  ADMIN = "ADMIN",
}
const userRoleValueEnum = pgEnum("user_role_value", [
  UserRoleValue.PUBLIC,
  UserRoleValue.CUSTOMER,
  UserRoleValue.PARTNER_ADMIN,
  UserRoleValue.PARTNER_EMPLOYEE,
  UserRoleValue.COURIER,
  UserRoleValue.ADMIN,
]);

/**
 * User roles table schema
 */
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: userRoleValueEnum("role").notNull(),
  partnerId: uuid("partner_id"),
});

/**
 * Schema for selecting user roles
 */
export const selectUserRoleSchema = createSelectSchema(userRoles);

/**
 * Schema for inserting user roles
 */
export const insertUserRoleSchema = createInsertSchema(userRoles);

/**
 * Type for user role model
 */
export type UserRole = z.infer<typeof selectUserRoleSchema>;

/**
 * Type for new user role model
 */
export type NewUserRole = z.infer<typeof insertUserRoleSchema>;

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
