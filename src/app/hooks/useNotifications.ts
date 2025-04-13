import { useCallback, useEffect, useState } from "react";

import type {
  NotificationClient,
  NotificationData,
} from "../utils/notification-client";
import { getNotificationClient } from "../utils/notification-client";

interface UseNotificationsOptions {
  channels?: string[];
  autoConnect?: boolean;
  userId?: string;
}

interface UseNotificationsReturn {
  isConnected: boolean;
  connect: (userId?: string) => Promise<string>;
  disconnect: () => void;
  subscribe: (channel: string) => Promise<void>;
  unsubscribe: (channel: string) => void;
  notifications: NotificationData[];
  clearNotifications: () => void;
}

/**
 * Hook for using notifications in React components
 */
export function useNotifications(
  options: UseNotificationsOptions = {},
): UseNotificationsReturn {
  const [client] = useState<NotificationClient>(() => getNotificationClient());
  const [isConnected, setIsConnected] = useState<boolean>(
    client.isConnectedToServer(),
  );
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  /**
   * Connect to notification server
   * @param userId - Optional user ID for authenticated connections
   * @returns Promise that resolves to the connection ID
   */
  const connect = useCallback(
    async (userId?: string) => {
      try {
        const connectionId = await client.connect(userId ?? options.userId);
        setIsConnected(true);
        return connectionId;
      } catch (error) {
        // Convert to proper error and rethrow
        const errorMessage =
          error instanceof Error ? error.message : "Unknown connection error";
        throw new Error(errorMessage);
      }
    },
    [client, options.userId],
  );

  // Disconnect from notification server
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
   * Clear all stored notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Handle connection status changes
   */
  useEffect(() => {
    const handleConnection = (): void => {
      setIsConnected(true);
    };

    client.onConnection(handleConnection);

    return (): void => {
      client.offConnection(handleConnection);
    };
  }, [client]);

  /**
   * Handle notifications from subscribed channels
   */
  useEffect(() => {
    const handleNotification = (notification: NotificationData): void => {
      setNotifications((prev) => [...prev, notification]);
    };

    // Subscribe to channels
    const channels = options.channels ?? [];
    channels.forEach((channel) => {
      client.onNotification(channel, handleNotification);
    });

    return (): void => {
      // Unsubscribe from channels
      channels.forEach((channel) => {
        client.offNotification(channel, handleNotification);
      });
    };
  }, [client, options.channels]);

  /**
   * Auto-connect if specified in options
   */
  useEffect(() => {
    if (options.autoConnect && !isConnected) {
      connect().catch((error) => {
        // Log error but don't crash the component
        if (error instanceof Error) {
          // Use logger instead of errorLogger
          const logger = (msg: string): void => {
            errorLogger(msg);
          };
          logger(`Notification connection error: ${error.message}`);
        }
      });
    }

    return (): void => {
      // Don't disconnect on unmount, as other components might be using the connection
    };
  }, [connect, isConnected, options.autoConnect]);

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    notifications,
    clearNotifications,
  };
}
