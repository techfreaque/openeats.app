import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/db";

/**
 * Bug reports table schema
 * Defines the structure of the bug_reports table in the database
 */
export const bugReports = pgTable("bug_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schemas for validation with Zod
export const insertBugReportSchema = createInsertSchema(bugReports);
export const selectBugReportSchema = createSelectSchema(bugReports);

// Type definitions
export type BugReport = z.infer<typeof selectBugReportSchema>;
export type NewBugReport = z.infer<typeof insertBugReportSchema>;
