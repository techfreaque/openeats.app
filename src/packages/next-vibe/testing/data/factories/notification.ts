import { UserRoleValue } from "../../../shared/types/enums";
import type { NotificationData } from "../../../shared/types/websocket";
import { createFactory } from "../factory";
import { dataRepository } from "../repository";
import { registerSeedGenerator } from "../seed-generator";
import { DataVariation } from "../types";

/**
 * Notification subscription request type
 */
export interface NotificationSubscribeRequest {
  channels: string[];
  deviceId: string;
}

/**
 * Notification subscription response type
 */
export interface NotificationSubscribeResponse {
  success: boolean;
  connectionId: string;
  subscribedChannels: string[];
}

/**
 * Notification send request type
 */
export interface NotificationSendRequest {
  channel: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Notification send response type
 */
export interface NotificationSendResponse {
  success: boolean;
  deliveredCount: number;
}

/**
 * Connection info type
 */
export interface ConnectionInfo {
  connectionId: string;
  userId?: string;
  deviceId: string;
  subscribedChannels: string[];
  connectedAt: number;
}

/**
 * Get connections response type
 */
export interface GetConnectionsResponse {
  connections: ConnectionInfo[];
}

/**
 * Factory for creating notification data
 */
export const notificationFactory = createFactory<NotificationData>({
  defaultVariation: DataVariation.DEFAULT,

  // Named examples that can be referenced by ID
  examples: {
    orderNotification: {
      channel: "orders",
      title: "New Order",
      message: "You have received a new order",
      data: {
        orderId: "order-123",
        amount: 25.99,
      },
      timestamp: 1_625_097_600_000,
      sender: {
        id: "user-123",
        role: UserRoleValue.ADMIN,
      },
    },

    announcementNotification: {
      channel: "announcements",
      title: "System Maintenance",
      message: "The system will be down for maintenance on Sunday from 2-4 AM",
      timestamp: 1_625_097_600_000,
      sender: {
        id: "admin-1",
        role: UserRoleValue.ADMIN,
      },
    },
  },

  // Factory functions for different variations
  variations: {
    [DataVariation.DEFAULT]: (index = 0) => ({
      channel: "general",
      title: `Notification ${index + 1}`,
      message: `This is notification ${index + 1}`,
      timestamp: Date.now(),
      sender: {
        id: "system",
        role: UserRoleValue.ADMIN,
      },
    }),

    [DataVariation.MINIMAL]: () => ({
      channel: "minimal",
      title: "Minimal",
      message: "Minimal notification",
      timestamp: Date.now(),
      sender: {
        id: "system",
        role: UserRoleValue.ADMIN,
      },
    }),

    [DataVariation.COMPLETE]: (index = 0) => ({
      channel: "complete",
      title: `Complete Notification ${index + 1}`,
      message: `This is a complete notification with all fields ${index + 1}`,
      data: {
        id: `notification-${index + 1}`,
        priority: "high",
        category: "system",
        tags: ["important", "action-required"],
        expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
      timestamp: Date.now(),
      sender: {
        id: "admin-1",
        role: UserRoleValue.ADMIN,
      },
    }),
  },
});

/**
 * Factory for creating notification subscription requests
 */
export const notificationSubscribeRequestFactory =
  createFactory<NotificationSubscribeRequest>({
    defaultVariation: DataVariation.DEFAULT,

    // Named examples
    examples: {
      default: {
        channels: ["orders", "announcements"],
        deviceId: "device-123",
      },

      minimal: {
        channels: ["general"],
        deviceId: "device-456",
      },
    },

    // Factory functions
    variations: {
      [DataVariation.DEFAULT]: (index = 0) => ({
        channels: ["orders", "announcements"],
        deviceId: `device-${index + 1}`,
      }),

      [DataVariation.MINIMAL]: (index = 0) => ({
        channels: ["general"],
        deviceId: `device-${index + 1}`,
      }),

      [DataVariation.COMPLETE]: (index = 0) => ({
        channels: ["orders", "announcements", "system", "chat"],
        deviceId: `device-${index + 1}`,
      }),
    },
  });

/**
 * Factory for creating notification subscription responses
 */
export const notificationSubscribeResponseFactory =
  createFactory<NotificationSubscribeResponse>({
    defaultVariation: DataVariation.DEFAULT,

    // Named examples
    examples: {
      default: {
        success: true,
        connectionId: "socket-123",
        subscribedChannels: ["orders", "announcements"],
      },
    },

    // Factory functions
    variations: {
      [DataVariation.DEFAULT]: (index = 0) => ({
        success: true,
        connectionId: `socket-${index + 1}`,
        subscribedChannels: ["orders", "announcements"],
      }),

      [DataVariation.MINIMAL]: (index = 0) => ({
        success: true,
        connectionId: `socket-${index + 1}`,
        subscribedChannels: ["general"],
      }),

      [DataVariation.COMPLETE]: (index = 0) => ({
        success: true,
        connectionId: `socket-${index + 1}`,
        subscribedChannels: ["orders", "announcements", "system", "chat"],
      }),
    },
  });

/**
 * Factory for creating notification send requests
 */
export const notificationSendRequestFactory =
  createFactory<NotificationSendRequest>({
    defaultVariation: DataVariation.DEFAULT,

    // Named examples
    examples: {
      default: {
        channel: "orders",
        title: "New Order",
        message: "You have received a new order",
        data: {
          orderId: "order-123",
          amount: 25.99,
        },
      },
    },

    // Factory functions
    variations: {
      [DataVariation.DEFAULT]: (index = 0) => ({
        channel: "orders",
        title: `New Order ${index + 1}`,
        message: `You have received a new order ${index + 1}`,
        data: {
          orderId: `order-${index + 1}`,
          amount: 25.99 + index,
        },
      }),

      [DataVariation.MINIMAL]: (index = 0) => ({
        channel: "general",
        title: `Notification ${index + 1}`,
        message: `This is notification ${index + 1}`,
      }),

      [DataVariation.COMPLETE]: (index = 0) => ({
        channel: "system",
        title: `System Alert ${index + 1}`,
        message: `Important system alert ${index + 1}`,
        data: {
          alertId: `alert-${index + 1}`,
          severity: "high",
          category: "system",
          actions: ["restart", "update"],
          timestamp: new Date().toISOString(),
        },
      }),
    },
  });

/**
 * Factory for creating notification send responses
 */
export const notificationSendResponseFactory =
  createFactory<NotificationSendResponse>({
    defaultVariation: DataVariation.DEFAULT,

    // Named examples
    examples: {
      default: {
        success: true,
        deliveredCount: 3,
      },
    },

    // Factory functions
    variations: {
      [DataVariation.DEFAULT]: () => ({
        success: true,
        deliveredCount: 3,
      }),

      [DataVariation.MINIMAL]: () => ({
        success: true,
        deliveredCount: 1,
      }),

      [DataVariation.COMPLETE]: (index = 0) => ({
        success: true,
        deliveredCount: 5 + index,
      }),
    },
  });

/**
 * Factory for creating connection info
 */
export const connectionInfoFactory = createFactory<ConnectionInfo>({
  defaultVariation: DataVariation.DEFAULT,

  // Named examples
  examples: {
    default: {
      connectionId: "socket-123",
      userId: "user-123",
      deviceId: "device-123",
      subscribedChannels: ["orders", "announcements"],
      connectedAt: 1_625_097_600_000,
    },
  },

  // Factory functions
  variations: {
    [DataVariation.DEFAULT]: (index = 0) => ({
      connectionId: `socket-${index + 1}`,
      userId: `user-${index + 1}`,
      deviceId: `device-${index + 1}`,
      subscribedChannels: ["orders", "announcements"],
      connectedAt: Date.now() - 3_600_000,
    }),

    [DataVariation.MINIMAL]: (index = 0) => ({
      connectionId: `socket-${index + 1}`,
      deviceId: `device-${index + 1}`,
      subscribedChannels: ["general"],
      connectedAt: Date.now() - 3_600_000,
    }),

    [DataVariation.COMPLETE]: (index = 0) => ({
      connectionId: `socket-${index + 1}`,
      userId: `user-${index + 1}`,
      deviceId: `device-${index + 1}`,
      subscribedChannels: ["orders", "announcements", "system", "chat"],
      connectedAt: Date.now() - 3_600_000,
    }),
  },
});

/**
 * Factory for creating get connections responses
 */
export const getConnectionsResponseFactory =
  createFactory<GetConnectionsResponse>({
    defaultVariation: DataVariation.DEFAULT,

    // Named examples
    examples: {
      default: {
        connections: [
          {
            connectionId: "socket-123",
            userId: "user-123",
            deviceId: "device-123",
            subscribedChannels: ["orders", "announcements"],
            connectedAt: 1_625_097_600_000,
          },
        ],
      },
    },

    // Factory functions
    variations: {
      [DataVariation.DEFAULT]: () => ({
        connections: [connectionInfoFactory.create()],
      }),

      [DataVariation.MINIMAL]: () => ({
        connections: [],
      }),

      [DataVariation.COMPLETE]: () => ({
        connections: connectionInfoFactory.createMany(5),
      }),
    },
  });

// Register factories with the repository
dataRepository.register("notification", notificationFactory);
dataRepository.register(
  "notificationSubscribeRequest",
  notificationSubscribeRequestFactory,
);
dataRepository.register(
  "notificationSubscribeResponse",
  notificationSubscribeResponseFactory,
);
dataRepository.register(
  "notificationSendRequest",
  notificationSendRequestFactory,
);
dataRepository.register(
  "notificationSendResponse",
  notificationSendResponseFactory,
);
dataRepository.register("connectionInfo", connectionInfoFactory);
dataRepository.register(
  "getConnectionsResponse",
  getConnectionsResponseFactory,
);

// Register seed generators
registerSeedGenerator("notifications", ({ count = 10 }) => {
  return notificationFactory.createMany(count);
});

registerSeedGenerator("connections", ({ count = 5 }) => {
  return connectionInfoFactory.createMany(count);
});

// Export factories for direct use
const notificationFactories = {
  notification: notificationFactory,
  notificationSubscribeRequest: notificationSubscribeRequestFactory,
  notificationSubscribeResponse: notificationSubscribeResponseFactory,
  notificationSendRequest: notificationSendRequestFactory,
  notificationSendResponse: notificationSendResponseFactory,
  connectionInfo: connectionInfoFactory,
  getConnectionsResponse: getConnectionsResponseFactory,
};

export default notificationFactories;
