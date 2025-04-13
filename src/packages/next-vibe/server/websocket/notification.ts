import type { NotificationData } from "../../shared/types/websocket";
import { debugLogger, errorLogger } from "../../shared/utils/logger";
import { getSocketServer } from "./server";

/**
 * Send notification to a channel
 * @param channel - Channel to send notification to
 * @param notification - Notification data
 * @returns Number of clients the notification was sent to
 */
export function sendNotificationToChannel(
  channel: string,
  notification: Omit<NotificationData, "channel" | "timestamp">,
): number {
  const io = getSocketServer();
  if (!io) {
    return 0;
  }

  try {
    const notificationData: NotificationData = {
      ...notification,
      channel,
      timestamp: Date.now(),
    };

    // Emit to all clients subscribed to the channel
    io.to(channel).emit("notification", notificationData);

    // Count delivered notifications
    const roomSize = io.sockets.adapter.rooms.get(channel)?.size ?? 0;
    debugLogger("Notification sent to channel", {
      channel,
      title: notification.title,
      recipients: roomSize,
    });
    return roomSize;
  } catch (error) {
    errorLogger("Failed to send notification to channel", error);
    return 0;
  }
}

/**
 * Send notification to a specific user
 * @param userId - User ID to send notification to
 * @param notification - Notification data
 * @returns Number of clients the notification was sent to
 */
export function sendNotificationToUser(
  userId: string,
  notification: Omit<NotificationData, "channel" | "timestamp">,
): number {
  const io = getSocketServer();
  if (!io) {
    return 0;
  }

  try {
    const userChannel = `user:${userId}`;
    const notificationData: NotificationData = {
      ...notification,
      channel: userChannel,
      timestamp: Date.now(),
    };

    // Emit to all clients in the user's channel
    io.to(userChannel).emit("notification", notificationData);

    // Count delivered notifications
    const roomSize = io.sockets.adapter.rooms.get(userChannel)?.size ?? 0;
    debugLogger("Notification sent to user", {
      userId,
      title: notification.title,
      recipients: roomSize,
    });
    return roomSize;
  } catch (error) {
    errorLogger("Failed to send notification to user", error);
    return 0;
  }
}

/**
 * Broadcast notification to all connected clients
 * @param notification - Notification data
 * @returns Number of clients the notification was sent to
 */
export function broadcastNotification(
  notification: Omit<NotificationData, "channel" | "timestamp">,
): number {
  const io = getSocketServer();
  if (!io) {
    return 0;
  }

  try {
    const notificationData: NotificationData = {
      ...notification,
      channel: "broadcast",
      timestamp: Date.now(),
    };

    // Emit to all connected clients
    io.emit("notification", notificationData);

    // Count connected clients
    const connectedClients = Object.keys(io.sockets.sockets).length;
    debugLogger("Notification broadcast to all clients", {
      title: notification.title,
      recipients: connectedClients,
    });
    return connectedClients;
  } catch (error) {
    errorLogger("Failed to broadcast notification", error);
    return 0;
  }
}

/**
 * Get the number of clients subscribed to a channel
 * @param channel - Channel to check
 * @returns Number of clients subscribed to the channel
 */
export function getChannelSubscriberCount(channel: string): number {
  const io = getSocketServer();
  if (!io) {
    return 0;
  }

  try {
    return io.sockets.adapter.rooms.get(channel)?.size ?? 0;
  } catch (error) {
    errorLogger("Failed to get channel subscriber count", error);
    return 0;
  }
}

/**
 * Get all active channels
 * @returns Array of active channels and their subscriber counts
 */
export function getActiveChannels(): {
  channel: string;
  subscribers: number;
}[] {
  const io = getSocketServer();
  if (!io) {
    return [];
  }

  try {
    const channels: { channel: string; subscribers: number }[] = [];
    io.sockets.adapter.rooms.forEach((_, channel) => {
      // Skip Socket.IO internal rooms (socket IDs)
      if (!channel.startsWith("/")) {
        channels.push({
          channel,
          subscribers: io.sockets.adapter.rooms.get(channel)?.size ?? 0,
        });
      }
    });
    return channels;
  } catch (error) {
    errorLogger("Failed to get active channels", error);
    return [];
  }
}
