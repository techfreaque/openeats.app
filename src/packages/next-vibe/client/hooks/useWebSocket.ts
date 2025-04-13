import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import type { NotificationDataType } from "../../../app/api/notification-api/schema";
import { debugLogger, errorLogger } from "../../shared/utils/logger";

/**
 * WebSocket connection status
 */
export enum WebSocketStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  AUTHENTICATED = "authenticated",
  ERROR = "error",
}

/**
 * WebSocket hook options
 */
export interface UseWebSocketOptions {
  /**
   * Automatically connect to the WebSocket server on mount
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Automatically reconnect to the WebSocket server on disconnect
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Reconnect interval in milliseconds
   * @default 5000
   */
  reconnectInterval?: number;

  /**
   * Maximum number of reconnect attempts
   * @default 5
   */
  maxReconnectAttempts?: number;

  /**
   * Callback function to handle notifications
   */
  onNotification?: (notification: NotificationDataType) => void;

  /**
   * Callback function to handle connection status changes
   */
  onStatusChange?: (status: WebSocketStatus) => void;

  /**
   * Callback function to handle errors
   */
  onError?: (error: Error) => void;
}

/**
 * WebSocket hook return value
 */
export interface UseWebSocketReturn {
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
   * Send a message to the WebSocket server
   * @param event - Event name
   * @param data - Event data
   */
  send: <T>(event: string, data: T) => void;

  /**
   * Current connection ID
   */
  connectionId: string | null;

  /**
   * Subscribed channels
   */
  subscribedChannels: string[];

  /**
   * Last error
   */
  error: Error | null;
}

/**
 * React hook for WebSocket connections
 * @param options - WebSocket hook options
 * @returns WebSocket hook return value
 */
export function useWebSocket(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  // Default options
  const {
    autoConnect = true,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onNotification,
    onStatusChange,
    onError,
  } = options;

  // State
  const [status, setStatus] = useState<WebSocketStatus>(
    WebSocketStatus.DISCONNECTED,
  );
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update status and call onStatusChange callback
  const updateStatus = useCallback(
    (newStatus: WebSocketStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  // Handle errors
  const handleError = useCallback(
    (err: Error) => {
      setError(err);
      errorLogger("WebSocket error", err);
      onError?.(err);
    },
    [onError],
  );

  // Connect to the WebSocket server
  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (
      status === WebSocketStatus.CONNECTED ||
      status === WebSocketStatus.CONNECTING ||
      status === WebSocketStatus.AUTHENTICATED
    ) {
      return;
    }

    try {
      // Update status
      updateStatus(WebSocketStatus.CONNECTING);

      // Create socket instance
      const socket = io({
        path: "/api/ws",
        transports: ["websocket"],
        autoConnect: true,
        reconnection: false, // We'll handle reconnection ourselves
        timeout: 10000,
      });

      // Store socket instance
      socketRef.current = socket;

      // Set up event listeners
      socket.on("connect", () => {
        debugLogger("WebSocket connected");
        updateStatus(WebSocketStatus.CONNECTED);
        reconnectAttemptsRef.current = 0;

        // Authenticate
        socket.emit("authenticate", {
          deviceId: `browser-${Math.random().toString(36).substring(2, 15)}`,
          userId: localStorage.getItem("userId"),
        });
      });

      socket.on("authenticated", (data: { connectionId: string }) => {
        debugLogger("WebSocket authenticated", data);
        setConnectionId(data.connectionId);
        updateStatus(WebSocketStatus.AUTHENTICATED);

        // Resubscribe to channels if any
        if (subscribedChannels.length > 0) {
          socket.emit("subscribe", { channels: subscribedChannels });
        }
      });

      socket.on("subscribed", (data: { subscribedChannels: string[] }) => {
        debugLogger("WebSocket subscribed", data);
        setSubscribedChannels(data.subscribedChannels);
      });

      socket.on("notification", (notification: NotificationDataType) => {
        debugLogger("WebSocket notification received", notification);
        onNotification?.(notification);
      });

      socket.on("error", (err: { message: string }) => {
        const error = new Error(err.message);
        handleError(error);
        updateStatus(WebSocketStatus.ERROR);
      });

      socket.on("disconnect", (reason: string) => {
        debugLogger("WebSocket disconnected", reason);
        updateStatus(WebSocketStatus.DISCONNECTED);

        // Attempt to reconnect if auto-reconnect is enabled
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            debugLogger(
              `WebSocket reconnecting (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
            );
            connect();
          }, reconnectInterval);
        }
      });

      // Connect to the server
      socket.connect();
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
      updateStatus(WebSocketStatus.ERROR);
    }
  }, [
    status,
    updateStatus,
    handleError,
    autoReconnect,
    maxReconnectAttempts,
    reconnectInterval,
    subscribedChannels,
    onNotification,
  ]);

  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Reset state
    setConnectionId(null);
    updateStatus(WebSocketStatus.DISCONNECTED);
  }, [updateStatus]);

  // Subscribe to notification channels
  const subscribe = useCallback(
    (channels: string[]) => {
      if (!socketRef.current || status !== WebSocketStatus.AUTHENTICATED) {
        // Store channels for later subscription
        setSubscribedChannels((prev) => [...new Set([...prev, ...channels])]);
        return;
      }

      // Subscribe to channels
      socketRef.current.emit("subscribe", { channels });
    },
    [status],
  );

  // Unsubscribe from notification channels
  const unsubscribe = useCallback(
    (channels: string[]) => {
      if (!socketRef.current || status !== WebSocketStatus.AUTHENTICATED) {
        // Remove channels from state
        setSubscribedChannels((prev) =>
          prev.filter((channel) => !channels.includes(channel)),
        );
        return;
      }

      // Unsubscribe from channels
      socketRef.current.emit("unsubscribe", { channels });
    },
    [status],
  );

  // Send a message to the WebSocket server
  const send = useCallback(
    <T>(event: string, data: T) => {
      if (!socketRef.current || status !== WebSocketStatus.AUTHENTICATED) {
        handleError(
          new Error("Cannot send message: WebSocket not authenticated"),
        );
        return;
      }

      // Send message
      socketRef.current.emit(event, data);
    },
    [status, handleError],
  );

  // Connect on mount if autoConnect is enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    connectionId,
    subscribedChannels,
    error,
  };
}
