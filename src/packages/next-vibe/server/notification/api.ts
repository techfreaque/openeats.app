import { NextResponse } from "next/server";
import { z } from "zod";

import { debugLogger, errorLogger } from "../../shared/utils/logger";
import type { JwtPayloadType } from "../endpoints/auth/jwt";
import {
  broadcastNotification,
  getActiveChannels,
  sendNotificationToChannel,
  sendNotificationToUser,
} from "../websocket/notification";
import {
  getActiveConnections,
  getSocketServer,
  getUserConnections,
} from "../websocket/server";

/**
 * Schema for notification data
 */
export const notificationDataSchema = z.object({
  channel: z.string().min(1, { message: "Channel is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  message: z.string().min(1, { message: "Message is required" }),
  data: z.record(z.unknown()).optional(),
});

/**
 * Send a notification to a channel
 * @param channel - Channel name
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Optional additional data
 * @param sender - Sender information
 * @returns Number of clients the notification was sent to
 */
export function sendNotification(
  channel: string,
  title: string,
  message: string,
  data: Record<string, unknown> | undefined,
  sender: {
    id: string;
    role: string;
  },
): number {
  try {
    // Validate notification data
    const validatedData = notificationDataSchema.parse({
      channel,
      title,
      message,
      data,
    });

    // Send notification
    const deliveredCount = sendNotificationToChannel(channel, {
      title: validatedData.title,
      message: validatedData.message,
      data: validatedData.data ?? {},
      sender,
    });

    debugLogger("Notification sent", {
      channel,
      title,
      deliveredCount,
      sender,
    });

    return deliveredCount;
  } catch (error) {
    errorLogger("Error sending notification", error);
    return 0;
  }
}

/**
 * Get active connections
 * @param user - Authenticated user
 * @returns Array of connection info objects
 */
export async function getConnections(user: JwtPayloadType): Promise<{
  success: boolean;
  message?: string;
  errorCode?: number;
  data?: { connections: unknown[] };
}> {
  try {
    // Check if user has admin permissions
    const userRole = (user as { role?: string })?.role ?? "";
    if (userRole !== "ADMIN") {
      return {
        success: false,
        message: "Insufficient permissions: Admin role required",
        errorCode: 403,
      };
    }

    // Get active connections
    const connections = await getActiveConnections();

    return {
      success: true,
      data: {
        connections,
      },
    };
  } catch (error) {
    errorLogger("Error getting connections", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * Get connections for a specific user
 * @param userId - User ID
 * @param user - Authenticated user
 * @returns Array of connection info objects
 */
export async function getUserConnectionsApi(
  userId: string,
  user: JwtPayloadType,
): Promise<{
  success: boolean;
  message?: string;
  errorCode?: number;
  data?: { connections: unknown[] };
}> {
  try {
    // Check if user has admin permissions or is requesting their own connections
    const userRole = (user as { role?: string })?.role ?? "";
    if (userRole !== "ADMIN" && user.id !== userId) {
      return {
        success: false,
        message: "Insufficient permissions: Admin role or own user ID required",
        errorCode: 403,
      };
    }

    // Get user connections
    const connections = await getUserConnections(userId);

    return {
      success: true,
      data: {
        connections,
      },
    };
  } catch (error) {
    errorLogger("Error getting user connections", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * WebSocket upgrade handler
 * @returns Response with WebSocket upgrade headers
 */
export function handleWebSocketUpgrade(): NextResponse {
  try {
    // Check if Socket.IO server is initialized
    if (!getSocketServer()) {
      throw new Error("WebSocket server not initialized");
    }

    // Return a response to acknowledge the WebSocket upgrade
    return new NextResponse(null, {
      status: 101, // Switching Protocols
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
      },
    });
  } catch (error) {
    errorLogger("WebSocket upgrade error", error);
    return NextResponse.json(
      {
        error: "WebSocket server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Get information about active channels and subscribers
 * @returns Object with channel information
 */
export function getNotificationChannelInfo(): {
  channels: { channel: string; subscribers: number }[];
  totalChannels: number;
  totalSubscribers: number;
} {
  try {
    // Check if WebSocket server is initialized
    if (!getSocketServer()) {
      return { channels: [], totalChannels: 0, totalSubscribers: 0 };
    }

    // Get active channels
    const channels = getActiveChannels();
    const totalSubscribers = channels.reduce(
      (sum, channel) => sum + channel.subscribers,
      0,
    );

    return {
      channels,
      totalChannels: channels.length,
      totalSubscribers,
    };
  } catch (error) {
    errorLogger("Failed to get notification channel info", error);
    return { channels: [], totalChannels: 0, totalSubscribers: 0 };
  }
}

/**
 * Send notification to a specific user
 * @param userId - User ID to send notification to
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Additional notification data
 * @param sender - Sender information
 * @returns Number of clients the notification was sent to
 */
export function sendUserNotification(
  userId: string,
  title: string,
  message: string,
  data?: Record<string, unknown>,
  sender?: { id: string; role: string },
): number {
  try {
    // Check if WebSocket server is initialized
    if (!getSocketServer()) {
      errorLogger("WebSocket server not initialized");
      return 0;
    }

    // Send notification to user
    return sendNotificationToUser(userId, {
      title,
      message,
      data: data ?? {},
      sender: sender ?? { id: "system", role: "ADMIN" },
    });
  } catch (error) {
    errorLogger("Failed to send user notification", error);
    return 0;
  }
}

/**
 * Broadcast notification to all connected clients
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Additional notification data
 * @param sender - Sender information
 * @returns Number of clients the notification was sent to
 */
export function broadcastSystemNotification(
  title: string,
  message: string,
  data?: Record<string, unknown>,
  sender?: { id: string; role: string },
): number {
  try {
    // Check if WebSocket server is initialized
    if (!getSocketServer()) {
      errorLogger("WebSocket server not initialized");
      return 0;
    }

    // Broadcast notification
    return broadcastNotification({
      title,
      message,
      data: data ?? {},
      sender: sender ?? { id: "system", role: "ADMIN" },
    });
  } catch (error) {
    errorLogger("Failed to broadcast notification", error);
    return 0;
  }
}
