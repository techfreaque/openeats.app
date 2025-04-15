/**
 * Notification send API route handler
 * Provides functionality for sending notifications
 */

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { formatResponse } from "next-vibe/server/endpoints/core/api-response";
import { hasRole } from "next-vibe/server/endpoints/data";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { userRolesRepository } from "@/app/api/v1/auth/repository";

import { notificationService } from "../notification.service";
import type {
  NotificationSendRequestType,
  NotificationSendRequestUrlParamsType,
  NotificationSendResponseOutputType,
} from "../schema";

/**
 * Send a notification
 * @param props - API handler props
 * @returns Result of sending the notification
 */
export const sendNotification: ApiHandlerFunction<
  NotificationSendRequestType,
  NotificationSendResponseOutputType,
  NotificationSendRequestUrlParamsType
> = async ({ data, user, urlParams }) => {
  try {
    const { channel, title, message, data: notificationData } = data;
    const { userId } = urlParams ?? {};

    debugLogger("Sending notification", {
      channel,
      title,
      userId,
      sender: user.id,
    });

    // Check user permissions
    const userRoles = await userRolesRepository.findByUserId(user.id);
    // Type assertion for userRoles to match the expected type for hasRole
    const typedUserRoles = userRoles as {
      id: string;
      role: UserRoleValue;
      partnerId?: string | null | undefined;
    }[];
    const isAdmin = hasRole(typedUserRoles, UserRoleValue.ADMIN);
    const isPartnerAdmin = hasRole(typedUserRoles, UserRoleValue.PARTNER_ADMIN);

    // Determine sender role
    let senderRole = "USER";
    if (isAdmin) {
      senderRole = "ADMIN";
    } else if (isPartnerAdmin) {
      senderRole = "RESTAURANT";
    } else if (hasRole(typedUserRoles, UserRoleValue.COURIER)) {
      senderRole = "DRIVER";
    }

    // Create notification data
    const notification = {
      channel,
      title,
      message,
      data: notificationData,
      timestamp: Date.now(),
      sender: {
        id: user.id,
        role: senderRole as "USER" | "ADMIN" | "RESTAURANT" | "DRIVER",
      },
    };

    let deliveredCount = 0;

    // Send to specific user if userId is provided
    if (userId) {
      // Check if user has permission to send to this user
      if (!isAdmin && user.id !== userId) {
        return {
          success: false,
          message: "Not authorized to send notifications to this user",
          errorCode: 403,
        };
      }

      deliveredCount = await notificationService.sendNotificationToUser(
        userId as string,
        notification,
      );
    } else {
      // Only admins and partner admins can send to channels
      if (!isAdmin && !isPartnerAdmin) {
        return {
          success: false,
          message: "Not authorized to send notifications to channels",
          errorCode: 403,
        };
      }

      deliveredCount = await notificationService.sendNotification(notification);
    }

    return formatResponse({
      success: true,
      deliveredCount,
    });
  } catch (error) {
    errorLogger("Error sending notification", error);
    return {
      success: false,
      message: "Failed to send notification",
      errorCode: 500,
    };
  }
};
