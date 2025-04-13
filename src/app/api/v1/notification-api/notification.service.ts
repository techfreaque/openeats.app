/**
 * Notification service
 * Provides functionality for managing notifications and WebSocket connections
 */

import type { Server } from "http";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";
import type { Socket } from "socket.io";
import { Server as SocketIOServer } from "socket.io";

import type { DbId } from "@/app/api/db/types";

import {
  notificationConnectionRepository,
  notificationRepository,
  notificationSubscriptionRepository,
} from "./notification.repository";
import type { NotificationDataType } from "./schema";

/**
 * Notification service class
 * Manages WebSocket connections and notifications
 */
export class NotificationService {
  private io: SocketIOServer | null = null;
  private connections: Map<string, Socket> = new Map();

  /**
   * Initialize the notification service with a server
   * @param server - The HTTP server
   */
  initialize(server: Server): void {
    if (this.io) {
      return;
    }

    this.io = new SocketIOServer(server, {
      path: "/api/v1/notification-api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.setupSocketHandlers();
    this.startCleanupJob();

    debugLogger("Notification service initialized");
  }

  /**
   * Set up socket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.io) {
      return;
    }

    this.io.on("connection", (socket) => {
      debugLogger("New socket connection", socket.id);

      // Store the socket connection
      this.connections.set(socket.id, socket);

      // Handle authentication
      socket.on(
        "authenticate",
        async (data: { userId?: string; deviceId: string }) => {
          try {
            const { userId, deviceId } = data;
            const userAgent = socket.handshake.headers["user-agent"] || "";
            const ipAddress = socket.handshake.address;

            debugLogger("Socket authentication", {
              socketId: socket.id,
              userId,
              deviceId,
            });

            // Create a connection record
            await notificationConnectionRepository.createConnection({
              connectionId: socket.id,
              userId: userId || null,
              deviceId,
              userAgent,
              ipAddress,
              connectedAt: new Date(),
              lastActivity: new Date(),
            });

            // Send authenticated event
            socket.emit("authenticated", { connectionId: socket.id });
          } catch (error) {
            errorLogger("Error authenticating socket", error);
            socket.emit("error", { message: "Authentication failed" });
          }
        },
      );

      // Handle subscription
      socket.on("subscribe", async (data: { channels: string[] }) => {
        try {
          const { channels } = data;
          debugLogger("Socket subscription", { socketId: socket.id, channels });

          // Update last activity
          await notificationConnectionRepository.updateLastActivity(socket.id);

          // Subscribe to channels
          const subscriptions =
            await notificationSubscriptionRepository.subscribeToChannels(
              socket.id,
              channels,
            );

          // Send subscribed event
          socket.emit("subscribed", {
            connectionId: socket.id,
            subscribedChannels: subscriptions.map((sub) => sub.channel),
          });
        } catch (error) {
          errorLogger("Error subscribing socket", error);
          socket.emit("error", { message: "Subscription failed" });
        }
      });

      // Handle unsubscription
      socket.on("unsubscribe", async (data: { channels: string[] }) => {
        try {
          const { channels } = data;
          debugLogger("Socket unsubscription", {
            socketId: socket.id,
            channels,
          });

          // Update last activity
          await notificationConnectionRepository.updateLastActivity(socket.id);

          // Unsubscribe from channels
          for (const channel of channels) {
            await notificationSubscriptionRepository.unsubscribe(
              socket.id,
              channel,
            );
          }

          // Get remaining subscriptions
          const subscriptions =
            await notificationSubscriptionRepository.findByConnectionId(
              socket.id,
            );

          // Send unsubscribed event
          socket.emit("unsubscribed", {
            connectionId: socket.id,
            subscribedChannels: subscriptions.map((sub) => sub.channel),
          });
        } catch (error) {
          errorLogger("Error unsubscribing socket", error);
          socket.emit("error", { message: "Unsubscription failed" });
        }
      });

      // Handle disconnection
      socket.on("disconnect", async () => {
        try {
          debugLogger("Socket disconnection", socket.id);

          // Mark connection as disconnected
          await notificationConnectionRepository.markAsDisconnected(socket.id);

          // Remove from connections map
          this.connections.delete(socket.id);
        } catch (error) {
          errorLogger("Error handling socket disconnection", error);
        }
      });
    });
  }

  /**
   * Start the cleanup job for inactive connections
   */
  private startCleanupJob(): void {
    // Run cleanup every hour
    setInterval(
      async () => {
        try {
          debugLogger("Running notification connection cleanup");

          // Delete connections that have been inactive for more than 24 hours
          const cutoffDate = new Date();
          cutoffDate.setHours(cutoffDate.getHours() - 24);

          await notificationConnectionRepository.deleteInactiveConnections(
            cutoffDate,
          );
        } catch (error) {
          errorLogger("Error cleaning up notification connections", error);
        }
      },
      60 * 60 * 1000,
    ); // 1 hour
  }

  /**
   * Send a notification to a channel
   * @param notification - The notification data
   * @returns The number of clients the notification was delivered to
   */
  async sendNotification(notification: NotificationDataType): Promise<number> {
    if (!this.io) {
      throw new Error("Notification service not initialized");
    }

    try {
      debugLogger("Sending notification", notification);

      // Get all connections subscribed to the channel
      const connectionIds =
        await notificationSubscriptionRepository.findConnectionsByChannel(
          notification.channel,
        );

      if (connectionIds.length === 0) {
        debugLogger(
          "No connections subscribed to channel",
          notification.channel,
        );
        return 0;
      }

      // Send notification to each connection
      let deliveredCount = 0;
      for (const connectionId of connectionIds) {
        const socket = this.connections.get(connectionId);
        if (socket) {
          socket.emit("notification", notification);
          deliveredCount++;
        }
      }

      debugLogger("Notification delivered", { deliveredCount });
      return deliveredCount;
    } catch (error) {
      errorLogger("Error sending notification", error);
      throw error;
    }
  }

  /**
   * Send a notification to a user
   * @param userId - The user ID
   * @param notification - The notification data
   * @returns The number of clients the notification was delivered to
   */
  async sendNotificationToUser(
    userId: DbId,
    notification: NotificationDataType,
  ): Promise<number> {
    if (!this.io) {
      throw new Error("Notification service not initialized");
    }

    try {
      debugLogger("Sending notification to user", { userId, notification });

      // Create a notification record
      await notificationRepository.createNotificationForUser(
        userId,
        notification.channel.toUpperCase(),
        notification.channel,
        notification.title,
        notification.message,
        notification.data,
      );

      // Get all active connections for the user
      const connections =
        await notificationConnectionRepository.findActiveByUserId(userId);

      if (connections.length === 0) {
        debugLogger("No active connections for user", userId);
        return 0;
      }

      // Send notification to each connection
      let deliveredCount = 0;
      for (const connection of connections) {
        const socket = this.connections.get(connection.connectionId);
        if (socket) {
          socket.emit("notification", notification);
          deliveredCount++;
        }
      }

      debugLogger("Notification delivered to user", { userId, deliveredCount });
      return deliveredCount;
    } catch (error) {
      errorLogger("Error sending notification to user", error);
      throw error;
    }
  }

  /**
   * Send a notification to multiple users
   * @param userIds - The user IDs
   * @param notification - The notification data
   * @returns The number of clients the notification was delivered to
   */
  async sendNotificationToUsers(
    userIds: DbId[],
    notification: NotificationDataType,
  ): Promise<number> {
    if (!this.io) {
      throw new Error("Notification service not initialized");
    }

    try {
      debugLogger("Sending notification to users", { userIds, notification });

      // Create notification records
      await notificationRepository.createNotificationsForUsers(
        userIds,
        notification.channel.toUpperCase(),
        notification.channel,
        notification.title,
        notification.message,
        notification.data,
      );

      let totalDeliveredCount = 0;
      for (const userId of userIds) {
        // Get all active connections for the user
        const connections =
          await notificationConnectionRepository.findActiveByUserId(userId);

        // Send notification to each connection
        for (const connection of connections) {
          const socket = this.connections.get(connection.connectionId);
          if (socket) {
            socket.emit("notification", notification);
            totalDeliveredCount++;
          }
        }
      }

      debugLogger("Notification delivered to users", {
        userIds,
        totalDeliveredCount,
      });
      return totalDeliveredCount;
    } catch (error) {
      errorLogger("Error sending notification to users", error);
      throw error;
    }
  }

  /**
   * Get all active connections
   * @returns The active connections
   */
  async getActiveConnections(): Promise<
    Array<{
      connectionId: string;
      userId: string | null;
      deviceId: string;
      subscribedChannels: string[];
      connectedAt: Date;
      lastActivity: Date;
      userAgent?: string;
      ipAddress?: string;
    }>
  > {
    try {
      // Get all active connections
      const connections =
        await notificationConnectionRepository.findAllActive();

      // Get subscriptions for each connection
      const result = await Promise.all(
        connections.map(async (connection) => {
          const subscriptions =
            await notificationSubscriptionRepository.findByConnectionId(
              connection.connectionId,
            );

          return {
            connectionId: connection.connectionId,
            userId: connection.userId,
            deviceId: connection.deviceId,
            subscribedChannels: subscriptions.map((sub) => sub.channel),
            connectedAt: connection.connectedAt,
            lastActivity: connection.lastActivity,
            userAgent: connection.userAgent,
            ipAddress: connection.ipAddress,
          };
        }),
      );

      return result;
    } catch (error) {
      errorLogger("Error getting active connections", error);
      throw error;
    }
  }
}

/**
 * Notification service singleton instance
 */
export const notificationService = new NotificationService();
