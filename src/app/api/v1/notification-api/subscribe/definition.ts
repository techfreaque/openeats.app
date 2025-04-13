import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  notificationSubscribeRequestSchema,
  notificationSubscribeRequestUrlParamsSchema,
  notificationSubscribeResponseSchema,
} from "../schema";

/**
 * POST endpoint for subscribing to notifications (WebSocket connection)
 */
const subscribeEndpoint = createEndpoint({
  description: "Subscribe to notification channels",
  method: Methods.POST,
  requestSchema: notificationSubscribeRequestSchema,
  responseSchema: notificationSubscribeResponseSchema,
  requestUrlSchema: notificationSubscribeRequestUrlParamsSchema,
  apiQueryOptions: {
    queryKey: ["notification-subscribe"],
  },
  fieldDescriptions: {
    channels: "Array of channel names to subscribe to",
    deviceId: "Unique identifier for the device",
    userId: "Optional user ID for authenticated users",
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Unauthorized",
    500: "Internal server error",
  },
  path: ["notification-api", "subscribe"],
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

export default subscribeEndpoint[Methods.POST];
