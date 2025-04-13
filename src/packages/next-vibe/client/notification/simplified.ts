import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { getApiConfig } from "../config";
import { getAuthToken } from "../storage/auth-client";
import { getDeviceId } from "../storage/device-client";

/**
 * Notification data
 */
export interface Notification {
  /** Notification ID */
  id: string;

  /** Notification channel */
  channel: string;

  /** Notification title */
  title: string;

  /** Notification message */
  message: string;

  /** Additional data */
  data?: Record<string, unknown>;

  /** Timestamp */
  timestamp: number;

  /** Sender information */
  sender?: {
    id: string;
    role: string;
  };
}

/**
 * Notification hook options
 */
export interface NotificationOptions {
  /** Channels to subscribe to */
  channels?: string[];

  /** Whether to automatically connect */
  autoConnect?: boolean;

  /** Maximum number of notifications to keep */
  maxNotifications?: number;

  /** WebSocket path */
  path?: string;

  /** Connection timeout in milliseconds */
  connectionTimeout?: number;

  /** Reconnection delay in milliseconds */
  reconnectionDelay?: number;

  /** Maximum reconnection attempts */
  maxReconnectionAttempts?: number;
}

/**
 * Notification hook result
 */
export interface NotificationHookResult {
  /** Whether connected to the notification server */
  isConnected: boolean;

  /** Whether connecting to the notification server */
  isConnecting: boolean;

  /** Connection error */
  error: Error | null;

  /** Notifications */
  notifications: Notification[];

  /** Connect to the notification server */
  connect: () => Promise<void>;

  /** Disconnect from the notification server */
  disconnect: () => void;

  /** Subscribe to channels */
  subscribe: (channels: string[]) => Promise<void>;

  /** Unsubscribe from channels */
  unsubscribe: (channels: string[]) => Promise<void>;

  /** Clear notifications */
  clearNotifications: () => void;

  /** Mark notification as read */
  markAsRead: (notificationId: string) => void;
}

/**
 * React hook for WebSocket notifications
 * @param options - Notification options
 * @returns Notification hook result
 */
export function useNotifications(
  options: NotificationOptions = {},
): NotificationHookResult {
  // Extract options with defaults
  const {
    channels = [],
    autoConnect = true,
    maxNotifications = 100,
    path = "/api/ws",
    connectionTimeout = 10000,
    reconnectionDelay = 5000,
    maxReconnectionAttempts = 5,
  } = options;

  // State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [reconnectTimer, setReconnectTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Connect to the notification server
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) {
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Get authentication token
      const token = await getAuthToken();
      const deviceId = await getDeviceId();

      // Get API config
      const apiConfig = getApiConfig();

      // Create socket connection
      const socketInstance = io(apiConfig.baseUrl, {
        path,
        auth: {
          token,
          deviceId,
        },
        reconnection: false, // We'll handle reconnection ourselves
        timeout: connectionTimeout,
      });

      // Set up event handlers
      socketInstance.on("connect", () => {
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);

        // Subscribe to channels
        if (channels.length > 0) {
          socketInstance.emit("subscribe", { channels });
        }
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);

        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectionAttempts) {
          const timer = setTimeout(() => {
            setReconnectAttempts((prev) => prev + 1);
            void connect();
          }, reconnectionDelay);

          setReconnectTimer(timer);
        }
      });

      socketInstance.on("error", (err: { message: string }) => {
        setError(new Error(err.message));
        setIsConnecting(false);
      });

      socketInstance.on("notification", (notification: Notification) => {
        setNotifications((prev) => {
          const newNotifications = [notification, ...prev];

          // Limit the number of notifications
          if (newNotifications.length > maxNotifications) {
            return newNotifications.slice(0, maxNotifications);
          }

          return newNotifications;
        });
      });

      // Store socket instance
      setSocket(socketInstance);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to connect"));
      setIsConnecting(false);
    }
  }, [
    isConnected,
    isConnecting,
    channels,
    path,
    connectionTimeout,
    reconnectionDelay,
    maxReconnectionAttempts,
    reconnectAttempts,
    maxNotifications,
  ]);

  // Disconnect from the notification server
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    setIsConnected(false);
    setIsConnecting(false);

    // Clear reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      setReconnectTimer(null);
    }
  }, [socket, reconnectTimer]);

  // Subscribe to channels
  const subscribe = useCallback(
    async (newChannels: string[]) => {
      if (!socket || !isConnected) {
        throw new Error("Not connected to notification server");
      }

      return await new Promise<void>((resolve, reject) => {
        socket.emit(
          "subscribe",
          { channels: newChannels },
          (response: { success: boolean; error?: string }) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error ?? "Failed to subscribe"));
            }
          },
        );
      });
    },
    [socket, isConnected],
  );

  // Unsubscribe from channels
  const unsubscribe = useCallback(
    async (channelsToUnsubscribe: string[]) => {
      if (!socket || !isConnected) {
        throw new Error("Not connected to notification server");
      }

      return await new Promise<void>((resolve, reject) => {
        socket.emit(
          "unsubscribe",
          { channels: channelsToUnsubscribe },
          (response: { success: boolean; error?: string }) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error ?? "Failed to unsubscribe"));
            }
          },
        );
      });
    },
    [socket, isConnected],
  );

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      void connect();
    }

    // Clean up on unmount
    return (): void => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    notifications,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearNotifications,
    markAsRead,
  };
}
