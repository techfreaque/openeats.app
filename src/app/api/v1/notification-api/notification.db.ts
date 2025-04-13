/**
 * Notification database schema
 * Defines the structure of the notifications table
 */

import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { users } from "../auth/me/users.db";

/**
 * Notification status enum
 * Defines the possible values for notification statuses
 */
export const notificationStatusEnum = pgEnum("notification_status", [
  "UNREAD",
  "READ",
  "ARCHIVED",
]);

/**
 * Notification type enum
 * Defines the possible values for notification types
 */
export const notificationTypeEnum = pgEnum("notification_type", [
  "ORDER",
  "DELIVERY",
  "PAYMENT",
  "SYSTEM",
  "MARKETING",
]);

/**
 * Notifications table schema
 */
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  channel: text("channel").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  status: notificationStatusEnum("status").notNull().default("UNREAD"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

/**
 * Schema for selecting notifications
 */
export const selectNotificationSchema = createSelectSchema(notifications);

/**
 * Schema for inserting notifications
 */
export const insertNotificationSchema = createInsertSchema(notifications);

/**
 * Type for notification model
 */
export type Notification = z.infer<typeof selectNotificationSchema>;

/**
 * Type for new notification model
 */
export type NewNotification = z.infer<typeof insertNotificationSchema>;

/**
 * Notification connections table schema
 */
export const notificationConnections = pgTable("notification_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: text("connection_id").notNull().unique(),
  userId: uuid("user_id").references(() => users.id),
  deviceId: text("device_id").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  lastActivity: timestamp("last_activity").defaultNow().notNull(),
  disconnectedAt: timestamp("disconnected_at"),
});

/**
 * Schema for selecting notification connections
 */
export const selectNotificationConnectionSchema = createSelectSchema(
  notificationConnections,
);

/**
 * Schema for inserting notification connections
 */
export const insertNotificationConnectionSchema = createInsertSchema(
  notificationConnections,
);

/**
 * Type for notification connection model
 */
export type NotificationConnection = z.infer<
  typeof selectNotificationConnectionSchema
>;

/**
 * Type for new notification connection model
 */
export type NewNotificationConnection = z.infer<
  typeof insertNotificationConnectionSchema
>;

/**
 * Notification subscriptions table schema
 */
export const notificationSubscriptions = pgTable("notification_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  connectionId: text("connection_id")
    .notNull()
    .references(() => notificationConnections.connectionId),
  channel: text("channel").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Schema for selecting notification subscriptions
 */
export const selectNotificationSubscriptionSchema = createSelectSchema(
  notificationSubscriptions,
);

/**
 * Schema for inserting notification subscriptions
 */
export const insertNotificationSubscriptionSchema = createInsertSchema(
  notificationSubscriptions,
);

/**
 * Type for notification subscription model
 */
export type NotificationSubscription = z.infer<
  typeof selectNotificationSubscriptionSchema
>;

/**
 * Type for new notification subscription model
 */
export type NewNotificationSubscription = z.infer<
  typeof insertNotificationSubscriptionSchema
>;
