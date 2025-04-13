import type { Socket } from "socket.io";

import type { UserRoleValue } from "./enums";

/**
 * User interface defining properties of an authenticated user
 */
export interface WebSocketUser {
  id: string;
  name: string;
  role: UserRoleValue;
}

/**
 * Extended Socket interface to include the authenticated user
 */
export interface AuthenticatedSocket extends Socket {
  user?: WebSocketUser;
}

/**
 * Base state data structure
 */
export interface BaseStateData {
  timestamp: number;
}

/**
 * User preferences state data
 */
export interface UserPreferencesState extends BaseStateData {
  type: "preferences";
  theme: "light" | "dark" | "system";
  notifications: boolean;
  language: string;
}

/**
 * Application state data
 */
export interface ApplicationState extends BaseStateData {
  type: "application";
  currentView: string;
  filters?: Record<string, string | number | boolean>;
  sortOrder?: "asc" | "desc";
  sortBy?: string;
}

/**
 * State update message structure
 */
export type StateUpdate = UserPreferencesState | ApplicationState;

/**
 * Announcement message structure for admin broadcasts
 */
export interface Announcement {
  title: string;
  message: string;
  timestamp: number;
}

/**
 * Error code type
 */
export type WebSocketErrorCode =
  | "AUTH_REQUIRED"
  | "PERMISSION_DENIED"
  | "INVALID_DATA"
  | "SERVER_ERROR";

/**
 * Error response structure
 */
export interface WebSocketErrorResponse {
  message: string;
  code?: WebSocketErrorCode;
}

/**
 * Authentication request structure
 */
export interface AuthRequest {
  deviceId: string;
  userId?: string;
  token?: string;
}

/**
 * Authentication response structure
 */
export interface AuthResponse {
  connectionId: string;
}

/**
 * Subscription request structure
 */
export interface SubscriptionRequest {
  channels: string[];
}

/**
 * Subscription response structure
 */
export interface SubscriptionResponse {
  connectionId: string;
  subscribedChannels: string[];
}

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
    role: string;
  };
}

/**
 * Connection information structure
 */
export interface ConnectionInfo {
  connectionId: string;
  userId?: string | undefined;
  deviceId: string;
  subscribedChannels: string[];
  connectedAt: number;
}

/**
 * Active connection structure with socket instance
 */
export interface ActiveConnection extends ConnectionInfo {
  socket: AuthenticatedSocket;
}
