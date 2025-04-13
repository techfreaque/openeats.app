import { z } from "zod";

/**
 * Notification sender schema
 */
export const notificationSenderSchema = z.object({
  id: z.string(),
  role: z.enum(["USER", "ADMIN", "RESTAURANT", "DRIVER", "SYSTEM"]),
});

export type NotificationSenderType = z.infer<typeof notificationSenderSchema>;

/**
 * Notification data schema
 */
export const notificationDataSchema = z.object({
  channel: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  timestamp: z.number().default(() => Date.now()),
  sender: notificationSenderSchema,
});

export type NotificationDataType = z.infer<typeof notificationDataSchema>;
