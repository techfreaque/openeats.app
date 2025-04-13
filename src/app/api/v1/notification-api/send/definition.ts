import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import {
  notificationSendRequestSchema,
  notificationSendRequestUrlParamsSchema,
  notificationSendResponseSchema,
} from "../schema";

/**
 * POST endpoint for sending notifications
 */
const sendEndpoint = createEndpoint({
  description: "Send a notification to subscribed clients",
  method: Methods.POST,
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
    userId: "User ID for the notification recipient",
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Unauthorized",
    403: "Forbidden - insufficient permissions",
    500: "Internal server error",
  },
  path: ["notification-api", "send"],
  examples: {
    payloads: {
      default: {
        channel: "orders",
        title: "New Order",
        message: "You have received a new order",
        data: {
          orderId: "order-123",
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

export default sendEndpoint[Methods.POST];
