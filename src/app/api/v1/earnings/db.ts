import {
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/db";

/**
 * Earnings table schema
 * Defines the structure of the earnings table in the database
 */
export const earnings = pgTable("earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull(),
  amount: numeric("amount").notNull(),
  deliveries: integer("deliveries").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertEarningSchema = createInsertSchema(earnings);
export const selectEarningSchema = createSelectSchema(earnings);

// Type definitions
export type Earning = z.infer<typeof selectEarningSchema>;
export type NewEarning = z.infer<typeof insertEarningSchema>;
