import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

interface NotificationOptions {
  url?: string;
  path?: string;
  autoReconnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

/**
 * User role type
 */
export type UserRole =
  | "admin"
  | "user"
  | "ADMIN"
  | "CUSTOMER"
  | "COURIER"
  | "PARTNER_ADMIN"
  | "PARTNER_EMPLOYEE";

/**
 * Notification data structure
 */
export interface NotificationData {
  channel: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
  sender: {
    id: string;
    role: UserRole;
  };
}

/**
 * Error code type
 */
export type ErrorCode =
  | "AUTH_REQUIRED"
  | "PERMISSION_DENIED"
  | "INVALID_DATA"
  | "SERVER_ERROR"
  | "CONNECTION_ERROR"
  | "TIMEOUT_ERROR";

/**
 * Error response structure
 */
export interface ErrorResponse {
  message: string;
  code?: ErrorCode;
}

/**
 * Authentication response structure
 */
export interface AuthResponse {
  connectionId: string;
}

/**
 * Subscription response structure
 */
export interface SubscriptionResponse {
  connectionId: string;
  subscribedChannels: string[];
}

type NotificationCallback = (notification: NotificationData) => void;
type ConnectionCallback = (connectionId: string) => void;
type ErrorCallback = (error: ErrorResponse) => void;

/**
 * NotificationClient - Client for interacting with the notification API
 */
export class NotificationClient {
  private socket: Socket | null = null;
  private deviceId: string;
  private userId: string | undefined;
  private connectionId: string | undefined;
  private subscribedChannels: Set<string> = new Set();
  private notificationCallbacks: Map<string, NotificationCallback[]> =
    new Map();
  private connectionCallbacks: ConnectionCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private options: Required<NotificationOptions>;
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
    this.deviceId = localStorage.getItem("notificationDeviceId") ?? uuidv4();
    localStorage.setItem("notificationDeviceId", this.deviceId);

    // Set default options
    this.options = {
      url: options.url ?? window.location.origin,
      path: options.path ?? "/api/notification-api/socket",
      autoReconnect: options.autoReconnect !== false,
      reconnectionAttempts: options.reconnectionAttempts ?? 5,
      reconnectionDelay: options.reconnectionDelay ?? 3000,
    };
  }

  /**
   * Connect to the notification server
   * @param userId - Optional user ID for authenticated connections
   * @returns Promise that resolves to the connection ID
   */
  connect(userId?: string): Promise<string> {
    if (this.isConnected || this.isConnecting) {
      return Promise.resolve(this.connectionId ?? "");
    }

    this.isConnecting = true;
    this.userId = userId;

    return new Promise((resolve, reject) => {
      try {
        // Initialize Socket.IO client
        this.socket = io(this.options.url, {
          path: this.options.path,
          autoConnect: true,
          reconnection: false, // We'll handle reconnection ourselves
        });

        // Set up event handlers
        this.socket.on("connect", this.handleConnect.bind(this));
        this.socket.on("disconnect", this.handleDisconnect.bind(this));
        this.socket.on("error", this.handleError.bind(this));
        this.socket.on("notification", this.handleNotification.bind(this));
        this.socket.on("authenticated", (data: AuthResponse) => {
          this.connectionId = data.connectionId;
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
        });

        // Authenticate
        this.socket.emit("authenticate", {
          deviceId: this.deviceId,
          userId: this.userId,
        });
      } catch (error) {
        this.isConnecting = false;
        const errorResponse: ErrorResponse = {
          message:
            error instanceof Error ? error.message : "Unknown connection error",
          code: "CONNECTION_ERROR",
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
      this.socket = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.connectionId = undefined;

    // Clear reconnect timer
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
   */
  unsubscribe(channel: string): void {
    // Remove channel from subscribed channels
    this.subscribedChannels.delete(channel);

    // Unsubscribe from channel
    if (this.isConnected) {
      this.socket?.emit("unsubscribe", { channels: [channel] });
    }
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
   */
  onConnection(callback: ConnectionCallback): void {
    this.connectionCallbacks.push(callback);
  }

  /**
   * Remove a connection callback
   */
  offConnection(callback: ConnectionCallback): void {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index !== -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  /**
   * Add an error callback
   */
  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove an error callback
   */
  offError(callback: ErrorCallback): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index !== -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  /**
   * Check if connected to the notification server
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get the connection ID
   */
  getConnectionId(): string | undefined {
    return this.connectionId;
  }

  /**
   * Get the device ID
   */
  getDeviceId(): string {
    return this.deviceId;
  }

  /**
   * Get the subscribed channels
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
    const errorResponse: ErrorResponse = {
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
          ? (error.code as ErrorCode)
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
      this.connect(this.userId).catch(() => {
        if (this.reconnectAttempts < this.options.reconnectionAttempts) {
          this.scheduleReconnect();
        }
      });
    }, this.options.reconnectionDelay);
  }
}

// Create a singleton instance
let notificationClientInstance: NotificationClient | null = null;

/**
 * Get the notification client instance
 */
export function getNotificationClient(): NotificationClient {
  if (!notificationClientInstance) {
    notificationClientInstance = new NotificationClient();
  }
  return notificationClientInstance;
}

export default getNotificationClient;
