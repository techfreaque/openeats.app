import { useCallback, useEffect, useState } from "react";

import type { NotificationDataType } from "../../shared/types/notification.schema";
import { debugLogger } from "../../shared/utils/logger";
import { useWebSocket, WebSocketStatus } from "./useWebSocket";

/**
 * Notification hook options
 */
export interface UseNotificationsOptions {
  /**
   * Channels to subscribe to
   * @default []
   */
  channels?: string[];

  /**
   * Automatically connect to the WebSocket server on mount
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Maximum number of notifications to keep in history
   * @default 50
   */
  maxHistory?: number;

  /**
   * Callback function to handle new notifications
   */
  onNotification?: (notification: NotificationDataType) => void;
}

/**
 * Notification hook return value
 */
export interface UseNotificationsReturn {
  /**
   * Current WebSocket connection status
   */
  status: WebSocketStatus;

  /**
   * Connect to the WebSocket server
   */
  connect: () => void;

  /**
   * Disconnect from the WebSocket server
   */
  disconnect: () => void;

  /**
   * Subscribe to notification channels
   * @param channels - Channels to subscribe to
   */
  subscribe: (channels: string[]) => void;

  /**
   * Unsubscribe from notification channels
   * @param channels - Channels to unsubscribe from
   */
  unsubscribe: (channels: string[]) => void;

  /**
   * Send a notification to a channel
   * @param channel - Channel to send the notification to
   * @param title - Notification title
   * @param message - Notification message
   * @param data - Additional notification data
   */
  sendNotification: (
    channel: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) => Promise<void>;

  /**
   * Clear notification history
   */
  clearHistory: () => void;

  /**
   * Notification history
   */
  notifications: NotificationDataType[];

  /**
   * Subscribed channels
   */
  subscribedChannels: string[];

  /**
   * Last error
   */
  error: Error | null;

  /**
   * Whether the WebSocket is connected and authenticated
   */
  isConnected: boolean;
}

/**
 * React hook for notifications
 * @param options - Notification hook options
 * @returns Notification hook return value
 */
export function useNotifications(
  options: UseNotificationsOptions = {},
): UseNotificationsReturn {
  // Default options
  const {
    channels = [],
    autoConnect = true,
    maxHistory = 50,
    onNotification,
  } = options;

  // State
  const [notifications, setNotifications] = useState<NotificationDataType[]>(
    [],
  );

  // WebSocket hook
  const {
    status,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    subscribedChannels,
    error,
  } = useWebSocket({
    autoConnect,
    onNotification: (notification) => {
      // Add notification to history
      setNotifications((prev) => {
        const newNotifications = [notification, ...prev];
        // Limit history size
        return newNotifications.slice(0, maxHistory);
      });

      // Call onNotification callback
      onNotification?.(notification);
    },
  });

  // Subscribe to channels on mount
  useEffect(() => {
    if (channels.length > 0 && status === WebSocketStatus.AUTHENTICATED) {
      subscribe(channels);
    }
  }, [channels, status, subscribe]);

  // Send a notification to a channel
  const sendNotification = useCallback(
    async (
      channel: string,
      title: string,
      message: string,
      data?: Record<string, unknown>,
    ): Promise<void> => {
      try {
        // Send notification via WebSocket if connected
        if (status === WebSocketStatus.AUTHENTICATED) {
          send("notification", {
            channel,
            title,
            message,
            data,
            timestamp: Date.now(),
          });
          return;
        }

        // Fall back to API if WebSocket is not connected
        const response = await fetch("/api/notification-api", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel,
            title,
            message,
            data,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to send notification: ${response.statusText}`,
          );
        }

        debugLogger("Notification sent via API", { channel, title });
      } catch (err) {
        throw new Error(
          `Failed to send notification: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    },
    [status, send],
  );

  // Clear notification history
  const clearHistory = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    status,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendNotification,
    clearHistory,
    notifications,
    subscribedChannels,
    error,
    isConnected: status === WebSocketStatus.AUTHENTICATED,
  };
}
