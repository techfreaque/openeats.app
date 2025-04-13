import "server-only";

import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import {
  getConnections,
  sendNotification,
} from "next-vibe/server/notification";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import {
  notificationGetConnectionsEndpoint,
  notificationSendEndpoint,
  notificationSubscribeEndpoint,
} from "./definition";

/**
 * Notification API route handlers
 * Provides WebSocket notification functionality
 */

/**
 * API handler for subscribing to notifications
 * This endpoint is used for initial setup, actual subscription happens via WebSocket
 */
export const POST = apiHandler({
  endpoint: notificationSubscribeEndpoint.POST,
  email: {},
  handler: ({ data, urlVariables, user }) => {
    try {
      debugLogger("Notification subscribe request", {
        data,
        urlVariables,
        user,
      });

      // In a real implementation, you might store subscription preferences in a database
      // await db.subscriptions.create({
      //   data: {
      //     userId: user.id,
      //     deviceId: data.deviceId,
      //     channels: data.channels,
      //   },
      // });

      // Return connection instructions
      return {
        success: true,
        data: {
          success: true,
          connectionId: "Use WebSocket connection",
          subscribedChannels: [],
        },
      };
    } catch (error) {
      errorLogger("Error in notification subscribe", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: 500,
      };
    }
  },
});

/**
 * API handler for sending notifications
 */
export const PUT = apiHandler({
  endpoint: notificationSendEndpoint.POST,
  email: {},
  handler: ({ data, urlVariables, user }) => {
    try {
      debugLogger("Notification send request", { data, urlVariables, user });

      // Validate data
      if (!data || typeof data !== "object") {
        throw new Error("Invalid notification data");
      }

      // Extract data with type safety
      const {
        channel,
        title,
        message,
        data: notificationData,
      } = data as {
        channel: string;
        title: string;
        message: string;
        data?: Record<string, unknown>;
      };

      if (!channel || !title || !message) {
        throw new Error("Missing required fields: channel, title, message");
      }

      // In a real implementation, you might log the notification to a database
      // await db.notifications.create({
      //   data: {
      //     channel,
      //     title,
      //     message,
      //     data: notificationData,
      //     sentBy: user.id,
      //     sentAt: new Date(),
      //   },
      // });

      // Send notification using the notification service
      const deliveredCount = sendNotification(
        channel,
        title,
        message,
        notificationData,
        {
          id: user.id,
          role: "USER",
        },
      );

      return {
        success: true,
        data: {
          success: true,
          deliveredCount,
        },
      };
    } catch (error) {
      errorLogger("Error in notification send", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: 500,
      };
    }
  },
});

/**
 * API handler for getting active connections
 * Admin-only endpoint to view all active WebSocket connections
 */
export const GET = apiHandler({
  endpoint: notificationGetConnectionsEndpoint.GET,
  email: {},
  handler: async ({ data: _data, urlVariables: _urlVariables, user }) => {
    try {
      debugLogger("Get notification connections request", { user });

      // Verify admin permissions (already checked by the API handler, but double-check)
      // Admin check is handled by the endpoint definition
      // This is just a fallback check
      if (user.id !== "admin") {
        return {
          success: false,
          message: "Insufficient permissions",
          errorCode: 403,
        } as const;
      }

      // Get connections using the notification service
      const result = await getConnections(user);

      if (!result.success) {
        return {
          success: false,
          message: result.message || "Unknown error",
          errorCode: result.errorCode || 500,
        } as const;
      }

      return {
        success: true,
        data: result.data || { connections: [] },
      } as const;
    } catch (error) {
      errorLogger("Error in get notification connections", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        errorCode: 500,
      } as const;
    }
  },
});
