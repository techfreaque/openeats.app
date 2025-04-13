import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  notificationGetConnectionsRequestSchema,
  notificationGetConnectionsRequestUrlParamsSchema,
  notificationGetConnectionsResponseSchema,
  notificationSendRequestSchema,
  notificationSendRequestUrlParamsSchema,
  notificationSendResponseSchema,
  notificationSubscribeRequestSchema,
  notificationSubscribeRequestUrlParamsSchema,
  notificationSubscribeResponseSchema,
} from "./schema";

// Endpoint for subscribing to notifications
const notificationSubscribeEndpoint = createEndpoint({
  description: "Subscribe to notification channels",
  method: Methods.POST,
  path: ["notification", "subscribe"],
  requestSchema: notificationSubscribeRequestSchema,
  responseSchema: notificationSubscribeResponseSchema,
  requestUrlSchema: notificationSubscribeRequestUrlParamsSchema,
  apiQueryOptions: {
    queryKey: ["notification-subscribe"],
  },
  fieldDescriptions: {
    channels: "Array of channel names to subscribe to",
    deviceId: "Unique device identifier",
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    500: "Server error",
  },
  examples: {
    payloads: {
      default: {
        channels: ["orders", "announcements"],
        deviceId: "device-123",
      },
    },
    urlPathVariables: {
      default: {},
    },
    responses: {
      default: {
        success: true,
        connectionId: "socket-123",
        subscribedChannels: ["orders", "announcements"],
      },
    },
  },
});

// Endpoint for sending notifications
const notificationSendEndpoint = createEndpoint({
  description: "Send a notification to subscribed clients",
  method: Methods.POST,
  path: ["notification", "send"],
  requestSchema: notificationSendRequestSchema,
  responseSchema: notificationSendResponseSchema,
  requestUrlSchema: notificationSendRequestUrlParamsSchema,
  apiQueryOptions: {
    queryKey: ["notification-send"],
  },
  fieldDescriptions: {
    channel: "Channel name to send the notification to",
    title: "Notification title",
    message: "Notification message",
    data: "Optional additional data to include with the notification",
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    500: "Server error",
  },
  examples: {
    payloads: {
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
    urlPathVariables: {
      default: {},
    },
    responses: {
      default: {
        success: true,
        deliveredCount: 3,
      },
    },
  },
});

// Endpoint for getting active connections
const notificationGetConnectionsEndpoint = createEndpoint({
  description: "Get active notification connections",
  method: Methods.GET,
  path: ["notification", "connections"],
  requestSchema: notificationGetConnectionsRequestSchema,
  responseSchema: notificationGetConnectionsResponseSchema,
  requestUrlSchema: notificationGetConnectionsRequestUrlParamsSchema,
  apiQueryOptions: {
    queryKey: ["notification-connections"],
  },
  fieldDescriptions: {
    connections: "List of active WebSocket connections",
  },
  allowedRoles: [UserRoleValue.ADMIN],
  errorCodes: {
    401: "Not authenticated",
    403: "Insufficient permissions",
    500: "Server error",
  },
  examples: {
    payloads: {
      default: {},
    },
    urlPathVariables: {
      default: {},
    },
    responses: {
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
  },
});

/**
 * Notification API endpoints
 */
// Export individual endpoints
export {
  notificationGetConnectionsEndpoint,
  notificationSendEndpoint,
  notificationSubscribeEndpoint,
};

// Export combined endpoints
const notificationEndpoints = {
  ...notificationSubscribeEndpoint,
  ...notificationSendEndpoint,
  ...notificationGetConnectionsEndpoint,
};

export default notificationEndpoints;
