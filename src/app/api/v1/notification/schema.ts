import { z } from "zod";

// Define a specific schema for notification data instead of using generic record
export const notificationDataSchema = z
  .object({
    orderId: z.string().optional(),
    menuItemId: z.string().optional(),
    userId: z.string().optional(),
    restaurantId: z.string().optional(),
    amount: z.number().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    timestamp: z.number().optional(),
    url: z.string().url().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          action: z.string(),
          data: z.record(z.string()).optional(),
        }),
      )
      .optional(),
    // Add additional specific fields as needed
  })
  .or(z.record(z.unknown())); // Allow for backwards compatibility

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
export const notificationSubscribeRequestUrlParamsSchema = z.object({});
export type NotificationSubscribeRequestUrlParamsType = z.infer<
  typeof notificationSubscribeRequestUrlParamsSchema
>;

// Schema for notification subscription response
export const notificationSubscribeResponseSchema = z.object({
  success: z.boolean(),
  connectionId: z.string(),
  subscribedChannels: z.array(z.string()),
});
export type NotificationSubscribeResponseType = z.infer<
  typeof notificationSubscribeResponseSchema
>;

// Schema for sending a notification
export const notificationSendRequestSchema = z.object({
  channel: z.string().min(1, { message: "Channel is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  data: notificationDataSchema.optional(),
});
export type NotificationSendRequestType = z.infer<
  typeof notificationSendRequestSchema
>;

// Schema for notification send URL parameters
export const notificationSendRequestUrlParamsSchema = z.object({});
export type NotificationSendRequestUrlParamsType = z.infer<
  typeof notificationSendRequestUrlParamsSchema
>;

// Schema for notification send response
export const notificationSendResponseSchema = z.object({
  success: z.boolean(),
  deliveredCount: z.number(),
});
export type NotificationSendResponseType = z.infer<
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

// Schema for connection info
export const connectionInfoSchema = z.object({
  connectionId: z.string(),
  userId: z.string().optional(),
  deviceId: z.string(),
  subscribedChannels: z.array(z.string()),
  connectedAt: z.number(),
});
export type ConnectionInfoType = z.infer<typeof connectionInfoSchema>;

// Schema for getting active connections response
export const notificationGetConnectionsResponseSchema = z.object({
  connections: z.array(connectionInfoSchema),
});
export type NotificationGetConnectionsResponseType = z.infer<
  typeof notificationGetConnectionsResponseSchema
>;
