/**
 * Website Editor database schema
 * Provides database schema for website editor related entities
 */

import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../auth/db";
import { partners } from "../restaurant/db";

/**
 * UI table schema
 * Stores UI components created by users
 */
export const ui = pgTable("ui", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  public: boolean("public").notNull().default(true),
  prompt: text("prompt").notNull(),
  img: text("img").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  uiType: text("ui_type").notNull(),
  likesCount: integer("likes_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  forkedFrom: uuid("forked_from"),
});

/**
 * SubPrompt table schema
 * Stores sub-prompts related to UI components
 */
export const subPrompts = pgTable("sub_prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  uiId: uuid("ui_id")
    .notNull()
    .references(() => ui.id, { onDelete: "cascade" }),
  subId: uuid("sub_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  subPrompt: text("sub_prompt").notNull(),
  modelId: text("model_id"),
});

/**
 * Code table schema
 * Stores code related to sub-prompts
 */
export const code = pgTable("code", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull(),
  subPromptId: uuid("sub_prompt_id")
    .notNull()
    .unique()
    .references(() => subPrompts.id, { onDelete: "cascade" }),
});

/**
 * Like table schema
 * Stores likes for UI components
 */
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  uiId: uuid("ui_id")
    .notNull()
    .references(() => ui.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * RestaurantSiteContent table schema
 * Stores website content for restaurants
 */
export const restaurantSiteContent = pgTable("restaurant_site_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  key: text("key").notNull(),
  icon: text("icon").notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => partners.id),
});

// Zod schemas for UI
export const selectUiSchema = createSelectSchema(ui);
export const insertUiSchema = createInsertSchema(ui, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type Ui = z.infer<typeof selectUiSchema>;
export type NewUi = z.infer<typeof insertUiSchema>;

// Zod schemas for SubPrompt
export const selectSubPromptSchema = createSelectSchema(subPrompts);
export const insertSubPromptSchema = createInsertSchema(subPrompts, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
});
export type SubPrompt = z.infer<typeof selectSubPromptSchema>;
export type NewSubPrompt = z.infer<typeof insertSubPromptSchema>;

// Zod schemas for Code
export const selectCodeSchema = createSelectSchema(code);
export const insertCodeSchema = createInsertSchema(code, {
  id: z.string().uuid().optional(),
});
export type Code = z.infer<typeof selectCodeSchema>;
export type NewCode = z.infer<typeof insertCodeSchema>;

// Zod schemas for Like
export const selectLikeSchema = createSelectSchema(likes);
export const insertLikeSchema = createInsertSchema(likes, {
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
});
export type Like = z.infer<typeof selectLikeSchema>;
export type NewLike = z.infer<typeof insertLikeSchema>;

// Zod schemas for RestaurantSiteContent
export const selectRestaurantSiteContentSchema = createSelectSchema(
  restaurantSiteContent,
);
export const insertRestaurantSiteContentSchema = createInsertSchema(
  restaurantSiteContent,
  {
    id: z.string().uuid().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  },
);
export type RestaurantSiteContent = z.infer<
  typeof selectRestaurantSiteContentSchema
>;
export type NewRestaurantSiteContent = z.infer<
  typeof insertRestaurantSiteContentSchema
>;
