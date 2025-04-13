import { pgEnum, pgTable, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../../auth/me/db";

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
 * Defines the structure of the user_roles table in the database
 */
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: userRoleValueEnum("role").notNull(),
  partnerId: uuid("partner_id"),
});

// Schemas for validation with Zod
export const insertUserRoleSchema = createInsertSchema(userRoles);
export const selectUserRoleSchema = createSelectSchema(userRoles);

// Type definitions
export type UserRole = z.infer<typeof selectUserRoleSchema>;
export type NewUserRole = z.infer<typeof insertUserRoleSchema>;
