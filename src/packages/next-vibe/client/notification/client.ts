import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import type {
  NotificationData,
  WebSocketErrorCode,
  WebSocketErrorResponse,
} from "../../shared/types/websocket";

/**
 * Notification client options
 */
export interface NotificationOptions {
  /**
   * WebSocket server URL (default: window.location.origin)
   */
  url?: string;

  /**
   * WebSocket server path (default: "/api/ws")
   */
  path?: string;

  /**
   * User ID for authentication
   */
  userId?: string;

  /**
   * Authentication token
   */
  token?: string;

  /**
   * Channels to subscribe to
   */
  channels?: string[];

  /**
   * Whether to automatically connect on initialization
   */
  autoConnect?: boolean;

  /**
   * Whether to automatically reconnect on disconnection
   */
  autoReconnect?: boolean;

  /**
   * Maximum number of reconnection attempts
   */
  reconnectionAttempts?: number;

  /**
   * Delay between reconnection attempts (in milliseconds)
   */
  reconnectionDelay?: number;
}

/**
 * Notification callback function
 */
export type NotificationCallback = (notification: NotificationData) => void;

/**
 * Connection callback function
 */
export type ConnectionCallback = (connectionId: string) => void;

/**
 * Error callback function
 */
export type ErrorCallback = (error: WebSocketErrorResponse) => void;

/**
 * Notification client for WebSocket communication
 */
export class NotificationClient {
  private socket: Socket | null = null;
  private deviceId: string;
  private userId: string | undefined;
  private token: string | undefined;
  private connectionId: string | undefined;
  private subscribedChannels: Set<string> = new Set();
  private notificationCallbacks: Map<string, NotificationCallback[]> =
    new Map();
  private connectionCallbacks: ConnectionCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private options: Required<Omit<NotificationOptions, "userId" | "token">> & {
    userId: string | undefined;
    token: string | undefined;
  };
  private isConnected = false;
  private isConnecting = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  /**
   * Create a new NotificationClient instance
   * @param options - Configuration options for the client
   */
  constructor(options: NotificationOptions = {}) {
    // Generate a device ID if not provided
    this.deviceId = localStorage?.getItem("notificationDeviceId") ?? uuidv4();
    if (localStorage) {
      localStorage.setItem("notificationDeviceId", this.deviceId);
    }

    this.userId = options.userId;
    this.token = options.token;

    // Set default options
    this.options = {
      url:
        options.url ??
        (typeof window === "undefined"
          ? "http://localhost:3000"
          : window.location.origin),
      path: options.path ?? "/api/ws",
      userId: options.userId,
      token: options.token,
      channels: options.channels ?? [],
      autoConnect: options.autoConnect !== false,
      autoReconnect: options.autoReconnect !== false,
      reconnectionAttempts: options.reconnectionAttempts ?? 5,
      reconnectionDelay: options.reconnectionDelay ?? 3000,
    };

    // Auto-connect if specified
    if (this.options.autoConnect) {
      this.connect();
    }
  }

  /**
   * Connect to the notification server
   * @param userId - Optional user ID for authenticated connections
   * @param token - Optional authentication token
   * @returns Promise that resolves to the connection ID
   */
  connect(userId?: string, token?: string): Promise<string> {
    if (this.isConnected || this.isConnecting) {
      return Promise.resolve(this.connectionId ?? "");
    }

    this.isConnecting = true;
    this.userId = userId ?? this.options.userId;
    this.token = token ?? this.options.token;

    return new Promise((resolve, reject) => {
      try {
        // Initialize Socket.IO client
        this.socket = io(this.options.url, {
          path: this.options.path,
          autoConnect: true,
          reconnection: false, // We'll handle reconnection ourselves
          auth: {
            token: this.token,
          },
          query: {
            deviceId: this.deviceId,
            userId: this.userId,
          },
        });

        // Set up event handlers
        void this.socket.on("connect", this.handleConnect.bind(this));
        void this.socket.on("disconnect", this.handleDisconnect.bind(this));
        void this.socket.on("error", this.handleError.bind(this));
        void this.socket.on("notification", this.handleNotification.bind(this));
        void this.socket.on(
          "connection-established",
          (_data: { userId: string; userName: string; userRole: string }) => {
            this.connectionId = this.socket?.id;
            this.isConnected = true;
            this.isConnecting = false;
            this.reconnectAttempts = 0;

            // Resubscribe to channels
            if (this.subscribedChannels.size > 0) {
              this.socket?.emit("subscribe", {
                channels: Array.from(this.subscribedChannels),
              });
            }

            // Notify connection callbacks
            this.connectionCallbacks.forEach((callback) => {
              if (this.connectionId) {
                callback(this.connectionId);
              }
            });

            resolve(this.connectionId ?? "");
          },
        );
      } catch (error) {
        this.isConnecting = false;
        const errorResponse: WebSocketErrorResponse = {
          message:
            error instanceof Error ? error.message : "Unknown connection error",
          code: "SERVER_ERROR",
        };
        this.handleError(errorResponse);
        reject(new Error(errorResponse.message));
      }
    });
  }

  /**
   * Disconnect from the notification server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }

    this.isConnected = false;
    this.connectionId = undefined;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Subscribe to a notification channel
   * @param channel - Channel name to subscribe to
   * @returns Promise that resolves when subscription is confirmed
   */
  subscribe(channel: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not connected to notification server"));
        return;
      }

      // Add channel to subscribed channels
      this.subscribedChannels.add(channel);

      // Subscribe to channel
      this.socket?.emit("subscribe", { channels: [channel] });

      // Set up one-time event handler for subscription confirmation
      this.socket?.once("subscribed", () => {
        resolve();
      });

      // Set up one-time event handler for subscription error
      this.socket?.once("error", (error: unknown) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "object" &&
                error !== null &&
                "message" in error &&
                typeof error.message === "string"
              ? error.message
              : "Unknown subscription error";
        reject(new Error(errorMessage));
      });
    });
  }

  /**
   * Unsubscribe from a notification channel
   * @param channel - Channel name to unsubscribe from
   */
  unsubscribe(channel: string): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    // Remove channel from subscribed channels
    this.subscribedChannels.delete(channel);

    // Unsubscribe from channel
    this.socket.emit("unsubscribe", { channels: [channel] });
  }

  /**
   * Send a notification to a channel
   * @param channel - Channel name to send to
   * @param title - Notification title
   * @param message - Notification message
   * @param data - Optional additional data
   * @returns Promise that resolves when notification is sent
   */
  sendNotification(
    channel: string,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error("Not connected to notification server"));
        return;
      }

      // Send notification
      this.socket?.emit("notification", {
        channel,
        title,
        message,
        data,
      });

      // Resolve immediately (no confirmation)
      resolve();
    });
  }

  /**
   * Add a notification callback for a specific channel
   * @param channel - Channel name to listen to
   * @param callback - Function to call when notification is received
   */
  onNotification(channel: string, callback: NotificationCallback): void {
    // Get callbacks for channel
    const callbacks = this.notificationCallbacks.get(channel) ?? [];

    // Add callback
    callbacks.push(callback);

    // Update callbacks
    this.notificationCallbacks.set(channel, callbacks);

    // Subscribe to channel if not already subscribed
    if (!this.subscribedChannels.has(channel) && this.isConnected) {
      this.subscribe(channel).catch((error) => {
        if (error instanceof Error) {
          this.handleError(error);
        } else {
          this.handleError(new Error("Failed to subscribe to channel"));
        }
      });
    }
  }

  /**
   * Remove a notification callback for a specific channel
   * @param channel - Channel name to stop listening to
   * @param callback - Function to remove from callbacks
   */
  offNotification(channel: string, callback: NotificationCallback): void {
    // Get callbacks for channel
    const callbacks = this.notificationCallbacks.get(channel) ?? [];

    // Remove callback
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    // Update callbacks
    this.notificationCallbacks.set(channel, callbacks);

    // Unsubscribe from channel if no callbacks left
    if (callbacks.length === 0) {
      this.unsubscribe(channel);
    }
  }

  /**
   * Add a connection callback
   * @param callback - Function to call when connection is established
   */
  onConnection(callback: ConnectionCallback): void {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Remove a connection callback
   * @param callback - Function to remove from callbacks
   */
  offConnection(callback: ConnectionCallback): void {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index !== -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  /**
   * Add an error callback
   * @param callback - Function to call when error occurs
   */
  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove an error callback
   * @param callback - Function to remove from callbacks
   */
  offError(callback: ErrorCallback): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index !== -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  /**
   * Get connection ID
   * @returns Connection ID or undefined if not connected
   */
  getConnectionId(): string | undefined {
    return this.connectionId;
  }

  /**
   * Get connection status
   * @returns True if connected, false otherwise
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get subscribed channels
   * @returns Array of subscribed channel names
   */
  getSubscribedChannels(): string[] {
    return Array.from(this.subscribedChannels);
  }

  /**
   * Handle connect event
   */
  private handleConnect(): void {
    // Connection established
  }

  /**
   * Handle disconnect event
   */
  private handleDisconnect(): void {
    this.isConnected = false;
    this.connectionId = undefined;

    // Attempt to reconnect if auto-reconnect is enabled
    if (
      this.options.autoReconnect &&
      this.reconnectAttempts < this.options.reconnectionAttempts
    ) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle error event
   * @param error - Error object or response
   */
  private handleError(error: unknown): void {
    // Convert error to proper ErrorResponse format
    const errorResponse: WebSocketErrorResponse = {
      message:
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Unknown error",
      code:
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? (error.code as WebSocketErrorCode)
          : "SERVER_ERROR",
    };

    // Notify error callbacks
    this.errorCallbacks.forEach((callback) => {
      callback(errorResponse);
    });
  }

  /**
   * Handle notification event
   * @param notification - Notification data
   */
  private handleNotification(notification: NotificationData): void {
    // Get callbacks for channel
    const callbacks =
      this.notificationCallbacks.get(notification.channel) ?? [];

    // Notify callbacks
    callbacks.forEach((callback) => {
      callback(notification);
    });
  }

  /**
   * Schedule reconnect
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.userId, this.token).catch(() => {
        if (this.reconnectAttempts < this.options.reconnectionAttempts) {
          this.scheduleReconnect();
        }
      });
    }, this.options.reconnectionDelay);
  }
}

// Singleton instance
let notificationClient: NotificationClient | null = null;

/**
 * Get the notification client instance
 * @param options - Configuration options for the client
 * @returns NotificationClient instance
 */
export function getNotificationClient(
  options: NotificationOptions = {},
): NotificationClient {
  if (!notificationClient) {
    notificationClient = new NotificationClient(options);
  }
  return notificationClient;
}
