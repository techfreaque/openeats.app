/**
 * User roles database schema
 * Defines the structure of the user_roles table
 */

import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../me/users.db";

/**
 * User role enum
 * Defines the possible values for user roles
 */
export const userRoleValueEnum = pgEnum("user_role_value", [
  "PUBLIC",
  "CUSTOMER",
  "PARTNER_ADMIN",
  "PARTNER_EMPLOYEE",
  "COURIER",
  "ADMIN",
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
 * Schema for user role creation
 */
export const createUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([
    "PUBLIC",
    "CUSTOMER",
    "PARTNER_ADMIN",
    "PARTNER_EMPLOYEE",
    "COURIER",
    "ADMIN",
  ]),
  partnerId: z.string().uuid().optional(),
});
