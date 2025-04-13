import { useCallback, useEffect, useState } from "react";

import type { NotificationData } from "../../shared/types/websocket";
import { errorLogger } from "../../shared/utils/logger";
import type {
  NotificationCallback,
  NotificationClient,
  NotificationOptions,
} from "./client";
import { getNotificationClient } from "./client";

/**
 * Hook options for useNotifications
 */
export interface UseNotificationsOptions extends NotificationOptions {
  /**
   * Whether to store notifications in state
   * @default true
   */
  storeNotifications?: boolean;
}

/**
 * Hook return type for useNotifications
 */
export interface UseNotificationsReturn {
  /**
   * Whether the client is connected to the notification server
   */
  isConnected: boolean;

  /**
   * Array of received notifications
   */
  notifications: NotificationData[];

  /**
   * Connect to the notification server
   * @param userId - Optional user ID for authenticated connections
   * @param token - Optional authentication token
   * @returns Promise that resolves to the connection ID
   */
  connect: (userId?: string, token?: string) => Promise<string>;

  /**
   * Disconnect from the notification server
   */
  disconnect: () => void;

  /**
   * Subscribe to a notification channel
   * @param channel - Channel name to subscribe to
   * @returns Promise that resolves when subscription is confirmed
   */
  subscribe: (channel: string) => Promise<void>;

  /**
   * Unsubscribe from a notification channel
   * @param channel - Channel name to unsubscribe from
   */
  unsubscribe: (channel: string) => void;

  /**
   * Send a notification to a channel
   * @param channel - Channel name to send to
   * @param title - Notification title
   * @param message - Notification message
   * @param data - Optional additional data
   * @returns Promise that resolves when notification is sent
   */
  sendNotification: (
    channel: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) => Promise<void>;

  /**
   * Clear all stored notifications
   */
  clearNotifications: () => void;

  /**
   * Add a notification callback for a specific channel
   * @param channel - Channel name to listen to
   * @param callback - Function to call when notification is received
   */
  onNotification: (channel: string, callback: NotificationCallback) => void;

  /**
   * Remove a notification callback for a specific channel
   * @param channel - Channel name to stop listening to
   * @param callback - Function to remove from callbacks
   */
  offNotification: (channel: string, callback: NotificationCallback) => void;

  /**
   * Get the notification client instance
   */
  client: NotificationClient;
}

/**
 * Hook for using notifications
 * @param options - Configuration options for the hook
 * @returns Hook return object
 */
export function useNotifications(
  options: UseNotificationsOptions = {},
): UseNotificationsReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Get notification client
  const client = getNotificationClient(options);

  // Default options
  const defaultOptions: Required<UseNotificationsOptions> = {
    url:
      options.url ??
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000"),
    path: options.path ?? "/api/ws",
    userId: options.userId,
    token: options.token,
    channels: options.channels ?? [],
    autoConnect: options.autoConnect !== false,
    autoReconnect: options.autoReconnect !== false,
    reconnectionAttempts: options.reconnectionAttempts ?? 5,
    reconnectionDelay: options.reconnectionDelay ?? 3000,
    storeNotifications: options.storeNotifications !== false,
  };

  /**
   * Connect to notification server
   * @param userId - Optional user ID for authenticated connections
   * @param token - Optional authentication token
   * @returns Promise that resolves to the connection ID
   */
  const connect = useCallback(
    async (userId?: string, token?: string) => {
      try {
        const connectionId = await client.connect(
          userId ?? defaultOptions.userId,
          token ?? defaultOptions.token,
        );
        setIsConnected(true);
        return connectionId;
      } catch (error) {
        // Convert to proper error and rethrow
        const errorMessage =
          error instanceof Error ? error.message : "Unknown connection error";
        throw new Error(errorMessage);
      }
    },
    [client, defaultOptions.userId, defaultOptions.token],
  );

  /**
   * Disconnect from notification server
   */
  const disconnect = useCallback(() => {
    client.disconnect();
    setIsConnected(false);
  }, [client]);

  /**
   * Subscribe to a notification channel
   * @param channel - Channel name to subscribe to
   * @returns Promise that resolves when subscription is confirmed
   */
  const subscribe = useCallback(
    async (channel: string) => {
      if (!isConnected) {
        await connect();
      }
      return await client.subscribe(channel);
    },
    [client, connect, isConnected],
  );

  /**
   * Unsubscribe from a notification channel
   * @param channel - Channel name to unsubscribe from
   */
  const unsubscribe = useCallback(
    (channel: string) => {
      client.unsubscribe(channel);
    },
    [client],
  );

  /**
   * Send a notification to a channel
   * @param channel - Channel name to send to
   * @param title - Notification title
   * @param message - Notification message
   * @param data - Optional additional data
   * @returns Promise that resolves when notification is sent
   */
  const sendNotification = useCallback(
    (
      channel: string,
      title: string,
      message: string,
      data?: Record<string, unknown>,
    ) => {
      return client.sendNotification(channel, title, message, data);
    },
    [client],
  );

  /**
   * Clear all stored notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Add a notification callback for a specific channel
   * @param channel - Channel name to listen to
   * @param callback - Function to call when notification is received
   */
  const onNotification = useCallback(
    (channel: string, callback: NotificationCallback) => {
      client.onNotification(channel, callback);
    },
    [client],
  );

  /**
   * Remove a notification callback for a specific channel
   * @param channel - Channel name to stop listening to
   * @param callback - Function to remove from callbacks
   */
  const offNotification = useCallback(
    (channel: string, callback: NotificationCallback) => {
      client.offNotification(channel, callback);
    },
    [client],
  );

  /**
   * Handle connection status changes
   */
  useEffect(() => {
    const handleConnection = () => {
      setIsConnected(true);
    };

    client.onConnection(handleConnection);

    return () => {
      client.offConnection(handleConnection);
    };
  }, [client]);

  /**
   * Handle notifications from subscribed channels
   */
  useEffect(() => {
    if (!defaultOptions.storeNotifications) {
      return;
    }

    const handleNotification = (notification: NotificationData) => {
      setNotifications((prev) => [...prev, notification]);
    };

    // Subscribe to channels
    const channels = defaultOptions.channels ?? [];
    channels.forEach((channel) => {
      client.onNotification(channel, handleNotification);
    });

    return () => {
      // Unsubscribe from channels
      channels.forEach((channel) => {
        client.offNotification(channel, handleNotification);
      });
    };
  }, [client, defaultOptions.channels, defaultOptions.storeNotifications]);

  /**
   * Auto-connect if specified in options
   */
  useEffect(() => {
    if (defaultOptions.autoConnect && !isConnected) {
      connect().catch((error) => {
        // Log error but don't crash the component
        if (error instanceof Error) {
          errorLogger(`Notification connection error:`, error);
        }
      });
    }

    return () => {
      // Don't disconnect on unmount, as other components might be using the connection
    };
  }, [connect, isConnected, defaultOptions.autoConnect]);

  return {
    isConnected,
    notifications,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendNotification,
    clearNotifications,
    onNotification,
    offNotification,
    client,
  };
}
