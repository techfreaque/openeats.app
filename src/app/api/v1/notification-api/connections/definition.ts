import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  notificationGetConnectionsRequestSchema,
  notificationGetConnectionsRequestUrlParamsSchema,
  notificationGetConnectionsResponseSchema,
} from "../schema";

/**
 * GET endpoint for retrieving active connections
 */
const connectionsEndpoint = createEndpoint({
  description: "Get all active notification connections",
  method: Methods.GET,
  requestSchema: notificationGetConnectionsRequestSchema,
  responseSchema: notificationGetConnectionsResponseSchema,
  requestUrlSchema: notificationGetConnectionsRequestUrlParamsSchema,
  apiQueryOptions: {
    queryKey: ["notification-connections"],
  },
  fieldDescriptions: {},
  allowedRoles: [UserRoleValue.ADMIN],
  errorCodes: {
    401: "Unauthorized",
    403: "Forbidden - insufficient permissions",
    500: "Internal server error",
  },
  path: ["notification-api", "connections"],
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

export default connectionsEndpoint[Methods.GET];
