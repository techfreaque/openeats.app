import type {
  Announcement,
  AuthenticatedSocket,
  NotificationData,
  StateUpdate,
  WebSocketErrorCode,
  WebSocketErrorResponse,
} from "../../shared/types/websocket";
import { debugLogger } from "../../shared/utils/logger";

/**
 * Creates a typed error response
 * @param message - Error message
 * @param code - Error code
 * @returns Typed error response object
 */
export const createWebsocketErrorResponse = (
  message: string,
  code: WebSocketErrorCode,
): WebSocketErrorResponse => {
  return { message, code };
};

/**
 * Validates that a socket has an authenticated user
 * @param socket - Socket to validate
 * @returns True if socket has a user, false otherwise
 */
export const validateAuthenticated = (socket: AuthenticatedSocket): boolean => {
  if (!socket.user) {
    socket.emit(
      "error",
      createWebsocketErrorResponse("Not authenticated", "AUTH_REQUIRED"),
    );
    return false;
  }
  return true;
};

/**
 * Validates that a user has admin role
 * @param socket - Socket with authenticated user
 * @returns True if user has admin role, false otherwise
 */
export const validateAdminRole = (socket: AuthenticatedSocket): boolean => {
  if (!socket.user) {
    return false;
  }

  if (socket.user.role !== "ADMIN") {
    socket.emit(
      "error",
      createWebsocketErrorResponse(
        "Permission denied: Admin role required",
        "PERMISSION_DENIED",
      ),
    );
    return false;
  }

  return true;
};

/**
 * Handles state update events from clients
 * Broadcasts state to all devices belonging to the same user
 * @param socket - Authenticated socket
 * @param data - State update data
 */
export const handleStateUpdate = (
  socket: AuthenticatedSocket,
  data: StateUpdate,
): void => {
  if (!validateAuthenticated(socket) || !socket.user) {
    return;
  }

  // Log the state update
  debugLogger(`State updated by ${socket.user.name} (${socket.user.id})`, data);

  // Broadcast to all other devices of the same user (excluding sender)
  socket.to(`user_${socket.user.id}`).emit("state-update", data);
};

/**
 * Handles announcement broadcasts from admin users
 * Validates admin role before broadcasting
 * @param socket - Authenticated socket
 * @param data - Announcement data
 */
export const handleAnnouncement = (
  socket: AuthenticatedSocket,
  data: Announcement,
): void => {
  if (
    !validateAuthenticated(socket) ||
    !validateAdminRole(socket) ||
    !socket.user
  ) {
    return;
  }

  // Add sender information to the announcement
  const enrichedAnnouncement = {
    ...data,
    senderName: socket.user.name,
    senderId: socket.user.id,
  };

  // Broadcast to all connected clients
  socket.broadcast.emit("announcement", enrichedAnnouncement);

  debugLogger(`Announcement broadcasted by admin ${socket.user.name}`, {
    title: data.title,
  });
};

/**
 * Handles notification events
 * @param socket - Authenticated socket
 * @param data - Notification data
 */
export const handleNotification = (
  socket: AuthenticatedSocket,
  data: NotificationData,
): void => {
  if (!validateAuthenticated(socket) || !socket.user) {
    return;
  }

  // Validate that the user has permission to send to this channel
  // This is a simple implementation - in a real app, you'd check against a database
  const canSendToChannel = true;

  if (!canSendToChannel) {
    socket.emit(
      "error",
      createWebsocketErrorResponse(
        "Permission denied: Cannot send to this channel",
        "PERMISSION_DENIED",
      ),
    );
    return;
  }

  // Add sender information to the notification
  const enrichedNotification: NotificationData = {
    ...data,
    timestamp: Date.now(),
    sender: {
      id: socket.user.id,
      role: socket.user.role,
    },
  };

  // Broadcast to all clients subscribed to the channel
  socket.to(data.channel).emit("notification", enrichedNotification);

  debugLogger(
    `Notification sent to channel ${data.channel} by ${socket.user.name}`,
    { title: data.title },
  );
};

/**
 * Sets up event listeners for a newly connected socket
 * @param socket - Authenticated socket
 */
export const setupSocketEventHandlers = (socket: AuthenticatedSocket): void => {
  const user = socket.user;

  if (!user) {
    socket.disconnect();
    return;
  }

  debugLogger(
    `User connected: ${user.name} (${user.id}) with role ${user.role}`,
  );

  // Register event handlers
  socket.on("state-update", (data: StateUpdate) =>
    handleStateUpdate(socket, data),
  );
  socket.on("broadcast-announcement", (data: Announcement) =>
    handleAnnouncement(socket, data),
  );
  socket.on("notification", (data: NotificationData) =>
    handleNotification(socket, data),
  );

  // Handle subscription to channels
  socket.on("subscribe", (data: { channels: string[] }) => {
    if (!validateAuthenticated(socket) || !socket.user) {
      return;
    }

    const { channels } = data;

    // Join Socket.IO rooms for each channel
    channels.forEach((channel) => {
      void socket.join(channel);
    });

    debugLogger(`User ${socket.user.name} subscribed to channels`, {
      channels,
    });

    // Acknowledge subscription
    socket.emit("subscribed", {
      connectionId: socket.id,
      subscribedChannels: channels,
    });
  });

  // Handle disconnection
  socket.on("disconnect", (): void => {
    if (user) {
      debugLogger(`User disconnected: ${user.name} (${user.id})`);
    }
  });

  // Notify user of successful connection
  socket.emit("connection-established", {
    userId: user.id,
    userName: user.name,
    userRole: user.role,
  });
};
