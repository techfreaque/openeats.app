/**
 * Notification repository implementation
 * Provides database access for notification-related operations
 */

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "@/app/api/db";
import { ApiRepositoryImpl } from "@/app/api/db/repository";

import type {
  NewNotification,
  NewNotificationConnection,
  NewNotificationSubscription,
  Notification,
  NotificationConnection,
  NotificationSubscription,
  selectNotificationConnectionSchema,
  selectNotificationSchema,
  selectNotificationSubscriptionSchema,
} from "./notification.db";
import {
  insertNotificationConnectionSchema,
  insertNotificationSchema,
  insertNotificationSubscriptionSchema,
  notificationConnections,
  notifications,
  notificationSubscriptions,
} from "./notification.db";

/**
 * Notification repository interface
 * Extends the base repository with notification-specific operations
 */
export interface NotificationRepository {
  /**
   * Find all notifications for a user
   * @param userId - The user ID
   * @param limit - The maximum number of notifications to return
   * @param offset - The number of notifications to skip
   */
  findByUserId(
    userId: DbId,
    limit?: number,
    offset?: number,
  ): Promise<Notification[]>;

  /**
   * Find all unread notifications for a user
   * @param userId - The user ID
   */
  findUnreadByUserId(userId: DbId): Promise<Notification[]>;

  /**
   * Mark a notification as read
   * @param id - The notification ID
   */
  markAsRead(id: DbId): Promise<Notification | undefined>;

  /**
   * Mark all notifications as read for a user
   * @param userId - The user ID
   */
  markAllAsRead(userId: DbId): Promise<boolean>;

  /**
   * Create a new notification
   * @param data - The notification data
   */
  createNotification(data: NewNotification): Promise<Notification>;

  /**
   * Create a notification for a user
   * @param userId - The user ID
   * @param type - The notification type
   * @param channel - The notification channel
   * @param title - The notification title
   * @param message - The notification message
   * @param data - The notification data
   */
  createNotificationForUser(
    userId: DbId,
    type: string,
    channel: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<Notification>;

  /**
   * Create notifications for multiple users
   * @param userIds - The user IDs
   * @param type - The notification type
   * @param channel - The notification channel
   * @param title - The notification title
   * @param message - The notification message
   * @param data - The notification data
   */
  createNotificationsForUsers(
    userIds: DbId[],
    type: string,
    channel: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<Notification[]>;

  /**
   * Delete a notification
   * @param id - The notification ID
   */
  deleteNotification(id: DbId): Promise<boolean>;

  /**
   * Delete all notifications for a user
   * @param userId - The user ID
   */
  deleteAllForUser(userId: DbId): Promise<boolean>;
}

/**
 * Notification repository implementation
 */
export class NotificationRepositoryImpl
  extends ApiRepositoryImpl<
    typeof notifications,
    Notification,
    NewNotification,
    typeof selectNotificationSchema
  >
  implements NotificationRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(notifications, insertNotificationSchema);
  }

  /**
   * Find all notifications for a user
   * @param userId - The user ID
   * @param limit - The maximum number of notifications to return
   * @param offset - The number of notifications to skip
   */
  async findByUserId(
    userId: DbId,
    limit = 50,
    offset = 0,
  ): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find all unread notifications for a user
   * @param userId - The user ID
   */
  async findUnreadByUserId(userId: DbId): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, "UNREAD"),
        ),
      )
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Mark a notification as read
   * @param id - The notification ID
   */
  async markAsRead(id: DbId): Promise<Notification | undefined> {
    return await this.update(id, {
      status: "READ",
      readAt: new Date(),
    });
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - The user ID
   */
  async markAllAsRead(userId: DbId): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({
        status: "READ",
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, "UNREAD"),
        ),
      )
      .returning({ id: notifications.id });

    return result.length > 0;
  }

  /**
   * Create a new notification
   * @param data - The notification data
   */
  async createNotification(data: NewNotification): Promise<Notification> {
    return await this.create(data);
  }

  /**
   * Create a notification for a user
   * @param userId - The user ID
   * @param type - The notification type
   * @param channel - The notification channel
   * @param title - The notification title
   * @param message - The notification message
   * @param data - The notification data
   */
  async createNotificationForUser(
    userId: DbId,
    type: string,
    channel: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<Notification> {
    return await this.create({
      userId,
      type: type as "ORDER" | "DELIVERY" | "PAYMENT" | "SYSTEM" | "MARKETING",
      channel,
      title,
      message,
      data,
      status: "UNREAD",
      createdAt: new Date(),
    });
  }

  /**
   * Create notifications for multiple users
   * @param userIds - The user IDs
   * @param type - The notification type
   * @param channel - The notification channel
   * @param title - The notification title
   * @param message - The notification message
   * @param data - The notification data
   */
  async createNotificationsForUsers(
    userIds: DbId[],
    type: string,
    channel: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<Notification[]> {
    if (userIds.length === 0) {
      return [];
    }

    const notificationsToCreate = userIds.map((userId) => ({
      userId,
      type: type as "ORDER" | "DELIVERY" | "PAYMENT" | "SYSTEM" | "MARKETING",
      channel,
      title,
      message,
      data,
      status: "UNREAD",
      createdAt: new Date(),
    }));

    const result = await db
      .insert(notifications)
      .values(notificationsToCreate)
      .returning();
    return result;
  }

  /**
   * Delete a notification
   * @param id - The notification ID
   */
  async deleteNotification(id: DbId): Promise<boolean> {
    return await this.delete(id);
  }

  /**
   * Delete all notifications for a user
   * @param userId - The user ID
   */
  async deleteAllForUser(userId: DbId): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(eq(notifications.userId, userId))
      .returning({ id: notifications.id });

    return result.length > 0;
  }
}

/**
 * Notification connection repository interface
 * Provides database access for notification connection-related operations
 */
export interface NotificationConnectionRepository {
  /**
   * Find all active connections
   */
  findAllActive(): Promise<NotificationConnection[]>;

  /**
   * Find a connection by ID
   * @param connectionId - The connection ID
   */
  findByConnectionId(
    connectionId: string,
  ): Promise<NotificationConnection | undefined>;

  /**
   * Find connections by user ID
   * @param userId - The user ID
   */
  findByUserId(userId: DbId): Promise<NotificationConnection[]>;

  /**
   * Find active connections by user ID
   * @param userId - The user ID
   */
  findActiveByUserId(userId: DbId): Promise<NotificationConnection[]>;

  /**
   * Create a new connection
   * @param data - The connection data
   */
  createConnection(
    data: NewNotificationConnection,
  ): Promise<NotificationConnection>;

  /**
   * Update a connection's last activity
   * @param connectionId - The connection ID
   */
  updateLastActivity(
    connectionId: string,
  ): Promise<NotificationConnection | undefined>;

  /**
   * Mark a connection as disconnected
   * @param connectionId - The connection ID
   */
  markAsDisconnected(
    connectionId: string,
  ): Promise<NotificationConnection | undefined>;

  /**
   * Delete a connection
   * @param connectionId - The connection ID
   */
  deleteConnection(connectionId: string): Promise<boolean>;

  /**
   * Delete all connections for a user
   * @param userId - The user ID
   */
  deleteAllForUser(userId: DbId): Promise<boolean>;

  /**
   * Delete inactive connections
   * @param olderThan - Delete connections older than this date
   */
  deleteInactiveConnections(olderThan: Date): Promise<boolean>;
}

/**
 * Notification connection repository implementation
 */
export class NotificationConnectionRepositoryImpl
  extends ApiRepositoryImpl<
    typeof notificationConnections,
    NotificationConnection,
    NewNotificationConnection,
    typeof selectNotificationConnectionSchema
  >
  implements NotificationConnectionRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(notificationConnections, insertNotificationConnectionSchema);
  }

  /**
   * Find all active connections
   */
  async findAllActive(): Promise<NotificationConnection[]> {
    return await db
      .select()
      .from(notificationConnections)
      .where(isNull(notificationConnections.disconnectedAt))
      .orderBy(desc(notificationConnections.lastActivity));
  }

  /**
   * Find a connection by ID
   * @param connectionId - The connection ID
   */
  async findByConnectionId(
    connectionId: string,
  ): Promise<NotificationConnection | undefined> {
    const results = await db
      .select()
      .from(notificationConnections)
      .where(eq(notificationConnections.connectionId, connectionId));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find connections by user ID
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<NotificationConnection[]> {
    return await db
      .select()
      .from(notificationConnections)
      .where(eq(notificationConnections.userId, userId))
      .orderBy(desc(notificationConnections.lastActivity));
  }

  /**
   * Find active connections by user ID
   * @param userId - The user ID
   */
  async findActiveByUserId(userId: DbId): Promise<NotificationConnection[]> {
    return await db
      .select()
      .from(notificationConnections)
      .where(
        and(
          eq(notificationConnections.userId, userId),
          isNull(notificationConnections.disconnectedAt),
        ),
      )
      .orderBy(desc(notificationConnections.lastActivity));
  }

  /**
   * Create a new connection
   * @param data - The connection data
   */
  async createConnection(
    data: NewNotificationConnection,
  ): Promise<NotificationConnection> {
    return await this.create(data);
  }

  /**
   * Update a connection's last activity
   * @param connectionId - The connection ID
   */
  async updateLastActivity(
    connectionId: string,
  ): Promise<NotificationConnection | undefined> {
    const results = await db
      .update(notificationConnections)
      .set({
        lastActivity: new Date(),
      })
      .where(eq(notificationConnections.connectionId, connectionId))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Mark a connection as disconnected
   * @param connectionId - The connection ID
   */
  async markAsDisconnected(
    connectionId: string,
  ): Promise<NotificationConnection | undefined> {
    const results = await db
      .update(notificationConnections)
      .set({
        disconnectedAt: new Date(),
      })
      .where(eq(notificationConnections.connectionId, connectionId))
      .returning();

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Delete a connection
   * @param connectionId - The connection ID
   */
  async deleteConnection(connectionId: string): Promise<boolean> {
    const results = await db
      .delete(notificationConnections)
      .where(eq(notificationConnections.connectionId, connectionId))
      .returning({ id: notificationConnections.id });

    return results.length > 0;
  }

  /**
   * Delete all connections for a user
   * @param userId - The user ID
   */
  async deleteAllForUser(userId: DbId): Promise<boolean> {
    const results = await db
      .delete(notificationConnections)
      .where(eq(notificationConnections.userId, userId))
      .returning({ id: notificationConnections.id });

    return results.length > 0;
  }

  /**
   * Delete inactive connections
   * @param olderThan - Delete connections older than this date
   */
  async deleteInactiveConnections(olderThan: Date): Promise<boolean> {
    const results = await db
      .delete(notificationConnections)
      .where(
        and(
          sql`${notificationConnections.lastActivity} < ${olderThan}`,
          isNull(notificationConnections.disconnectedAt),
        ),
      )
      .returning({ id: notificationConnections.id });

    return results.length > 0;
  }
}

/**
 * Notification subscription repository interface
 * Provides database access for notification subscription-related operations
 */
export interface NotificationSubscriptionRepository {
  /**
   * Find all subscriptions for a connection
   * @param connectionId - The connection ID
   */
  findByConnectionId(connectionId: string): Promise<NotificationSubscription[]>;

  /**
   * Find all connections subscribed to a channel
   * @param channel - The channel
   */
  findConnectionsByChannel(channel: string): Promise<string[]>;

  /**
   * Create a new subscription
   * @param data - The subscription data
   */
  createSubscription(
    data: NewNotificationSubscription,
  ): Promise<NotificationSubscription>;

  /**
   * Subscribe a connection to a channel
   * @param connectionId - The connection ID
   * @param channel - The channel
   */
  subscribe(
    connectionId: string,
    channel: string,
  ): Promise<NotificationSubscription>;

  /**
   * Subscribe a connection to multiple channels
   * @param connectionId - The connection ID
   * @param channels - The channels
   */
  subscribeToChannels(
    connectionId: string,
    channels: string[],
  ): Promise<NotificationSubscription[]>;

  /**
   * Unsubscribe a connection from a channel
   * @param connectionId - The connection ID
   * @param channel - The channel
   */
  unsubscribe(connectionId: string, channel: string): Promise<boolean>;

  /**
   * Unsubscribe a connection from all channels
   * @param connectionId - The connection ID
   */
  unsubscribeFromAll(connectionId: string): Promise<boolean>;

  /**
   * Delete all subscriptions for a connection
   * @param connectionId - The connection ID
   */
  deleteAllForConnection(connectionId: string): Promise<boolean>;
}

/**
 * Notification subscription repository implementation
 */
export class NotificationSubscriptionRepositoryImpl
  extends ApiRepositoryImpl<
    typeof notificationSubscriptions,
    NotificationSubscription,
    NewNotificationSubscription,
    typeof selectNotificationSubscriptionSchema
  >
  implements NotificationSubscriptionRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(notificationSubscriptions, insertNotificationSubscriptionSchema);
  }

  /**
   * Find all subscriptions for a connection
   * @param connectionId - The connection ID
   */
  async findByConnectionId(
    connectionId: string,
  ): Promise<NotificationSubscription[]> {
    return await db
      .select()
      .from(notificationSubscriptions)
      .where(eq(notificationSubscriptions.connectionId, connectionId));
  }

  /**
   * Find all connections subscribed to a channel
   * @param channel - The channel
   */
  async findConnectionsByChannel(channel: string): Promise<string[]> {
    const results = await db
      .select({ connectionId: notificationSubscriptions.connectionId })
      .from(notificationSubscriptions)
      .where(eq(notificationSubscriptions.channel, channel))
      .innerJoin(
        notificationConnections,
        and(
          eq(
            notificationSubscriptions.connectionId,
            notificationConnections.connectionId,
          ),
          isNull(notificationConnections.disconnectedAt),
        ),
      );

    return results.map((result) => result.connectionId);
  }

  /**
   * Create a new subscription
   * @param data - The subscription data
   */
  async createSubscription(
    data: NewNotificationSubscription,
  ): Promise<NotificationSubscription> {
    return await this.create(data);
  }

  /**
   * Subscribe a connection to a channel
   * @param connectionId - The connection ID
   * @param channel - The channel
   */
  async subscribe(
    connectionId: string,
    channel: string,
  ): Promise<NotificationSubscription> {
    // Check if the subscription already exists
    const existingSubscription = await db
      .select()
      .from(notificationSubscriptions)
      .where(
        and(
          eq(notificationSubscriptions.connectionId, connectionId),
          eq(notificationSubscriptions.channel, channel),
        ),
      );

    if (existingSubscription.length > 0) {
      return existingSubscription[0];
    }

    // Create a new subscription
    return await this.create({
      connectionId,
      channel,
      createdAt: new Date(),
    });
  }

  /**
   * Subscribe a connection to multiple channels
   * @param connectionId - The connection ID
   * @param channels - The channels
   */
  async subscribeToChannels(
    connectionId: string,
    channels: string[],
  ): Promise<NotificationSubscription[]> {
    if (channels.length === 0) {
      return [];
    }

    // Get existing subscriptions
    const existingSubscriptions = await db
      .select()
      .from(notificationSubscriptions)
      .where(
        and(
          eq(notificationSubscriptions.connectionId, connectionId),
          sql`${notificationSubscriptions.channel} IN (${channels.join(",")})`,
        ),
      );

    const existingChannels = existingSubscriptions.map((sub) => sub.channel);
    const newChannels = channels.filter(
      (channel) => !existingChannels.includes(channel),
    );

    if (newChannels.length === 0) {
      return existingSubscriptions;
    }

    // Create new subscriptions
    const newSubscriptions = newChannels.map((channel) => ({
      connectionId,
      channel,
      createdAt: new Date(),
    }));

    const createdSubscriptions = await db
      .insert(notificationSubscriptions)
      .values(newSubscriptions)
      .returning();

    return [...existingSubscriptions, ...createdSubscriptions];
  }

  /**
   * Unsubscribe a connection from a channel
   * @param connectionId - The connection ID
   * @param channel - The channel
   */
  async unsubscribe(connectionId: string, channel: string): Promise<boolean> {
    const results = await db
      .delete(notificationSubscriptions)
      .where(
        and(
          eq(notificationSubscriptions.connectionId, connectionId),
          eq(notificationSubscriptions.channel, channel),
        ),
      )
      .returning({ id: notificationSubscriptions.id });

    return results.length > 0;
  }

  /**
   * Unsubscribe a connection from all channels
   * @param connectionId - The connection ID
   */
  async unsubscribeFromAll(connectionId: string): Promise<boolean> {
    const results = await db
      .delete(notificationSubscriptions)
      .where(eq(notificationSubscriptions.connectionId, connectionId))
      .returning({ id: notificationSubscriptions.id });

    return results.length > 0;
  }

  /**
   * Delete all subscriptions for a connection
   * @param connectionId - The connection ID
   */
  async deleteAllForConnection(connectionId: string): Promise<boolean> {
    return await this.unsubscribeFromAll(connectionId);
  }
}

/**
 * Notification repository singleton instance
 */
export const notificationRepository = new NotificationRepositoryImpl();

/**
 * Notification connection repository singleton instance
 */
export const notificationConnectionRepository =
  new NotificationConnectionRepositoryImpl();

/**
 * Notification subscription repository singleton instance
 */
export const notificationSubscriptionRepository =
  new NotificationSubscriptionRepositoryImpl();
