import { z } from "zod";

// Schema for notification subscription request
export const notificationSubscribeRequestSchema = z.object({
  channels: z
    .array(z.string())
    .min(1, { message: "At least one channel is required" }),
  deviceId: z.string().min(1, { message: "Device ID is required" }),
});
export type NotificationSubscribeRequestType = z.infer<
  typeof notificationSubscribeRequestSchema
>;

// Schema for notification subscription URL parameters
export const notificationSubscribeRequestUrlParamsSchema = z.object({
  userId: z.string().optional(),
});
export type NotificationSubscribeRequestUrlParamsType = z.infer<
  typeof notificationSubscribeRequestUrlParamsSchema
>;

// Schema for notification subscription response
export const notificationSubscribeResponseSchema = z.object({
  success: z.boolean(),
  connectionId: z.string(),
  subscribedChannels: z.array(z.string()),
});
export type NotificationSubscribeResponseInputType = z.input<
  typeof notificationSubscribeResponseSchema
>;
export type NotificationSubscribeResponseOutputType = z.output<
  typeof notificationSubscribeResponseSchema
>;

// Schema for sending a notification
export const notificationSendRequestSchema = z.object({
  channel: z.string().min(1, { message: "Channel is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  data: z.record(z.unknown()).optional(),
});
export type NotificationSendRequestType = z.infer<
  typeof notificationSendRequestSchema
>;

// Schema for notification send URL parameters
export const notificationSendRequestUrlParamsSchema = z.object({
  userId: z.string().optional(),
});
export type NotificationSendRequestUrlParamsType = z.infer<
  typeof notificationSendRequestUrlParamsSchema
>;

// Schema for notification send response
export const notificationSendResponseSchema = z.object({
  success: z.boolean(),
  deliveredCount: z.number(),
});
export type NotificationSendResponseInputType = z.input<
  typeof notificationSendResponseSchema
>;
export type NotificationSendResponseOutputType = z.output<
  typeof notificationSendResponseSchema
>;

// Schema for getting active connections
export const notificationGetConnectionsRequestSchema = z.object({});
export type NotificationGetConnectionsRequestType = z.infer<
  typeof notificationGetConnectionsRequestSchema
>;

// Schema for getting active connections URL parameters
export const notificationGetConnectionsRequestUrlParamsSchema = z.object({});
export type NotificationGetConnectionsRequestUrlParamsType = z.infer<
  typeof notificationGetConnectionsRequestUrlParamsSchema
>;

// Connection information schema
export const connectionInfoSchema = z.object({
  connectionId: z.string(),
  userId: z.string().optional(),
  deviceId: z.string(),
  subscribedChannels: z.array(z.string()),
  connectedAt: z.number(),
  lastActivity: z.number().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});
export type ConnectionInfoType = z.infer<typeof connectionInfoSchema>;

// Schema for getting active connections response
export const notificationGetConnectionsResponseSchema = z.object({
  connections: z.array(connectionInfoSchema),
});
export type NotificationGetConnectionsResponseInputType = z.input<
  typeof notificationGetConnectionsResponseSchema
>;
export type NotificationGetConnectionsResponseOutputType = z.output<
  typeof notificationGetConnectionsResponseSchema
>;

// Notification sender schema
export const notificationSenderSchema = z.object({
  id: z.string(),
  role: z.enum(["USER", "ADMIN", "RESTAURANT", "DRIVER"]),
});
export type NotificationSenderType = z.infer<typeof notificationSenderSchema>;

// Notification data schema
export const notificationDataSchema = z.object({
  channel: z.string(),
  title: z.string(),
  message: z.string(),
  data: z.record(z.unknown()).optional(),
  timestamp: z.number().default(() => Date.now()),
  sender: notificationSenderSchema,
});
export type NotificationDataType = z.infer<typeof notificationDataSchema>;
