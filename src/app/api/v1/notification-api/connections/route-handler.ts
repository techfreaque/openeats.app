/**
 * Notification connections API route handler
 * Provides functionality for retrieving active notification connections
 */

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { formatResponse } from "next-vibe/server/endpoints/core/api-response";
import { hasRole } from "next-vibe/server/endpoints/data";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { userRolesRepository } from "@/app/api/v1/auth/roles/roles.repository";

import { notificationService } from "../notification.service";
import type {
  NotificationGetConnectionsRequestType,
  NotificationGetConnectionsResponseOutputType,
} from "../schema";

/**
 * Get all active notification connections
 * @param props - API handler props
 * @returns List of active connections
 */
export const getConnections: ApiHandlerFunction<
  NotificationGetConnectionsRequestType,
  NotificationGetConnectionsResponseOutputType,
  undefined
> = async ({ user }) => {
  try {
    debugLogger("Getting active notification connections");

    // Check if user is admin
    const userRoles = await userRolesRepository.findByUserId(user.id);
    const isAdmin = hasRole(
      userRoles as {
        id: string;
        role: UserRoleValue;
        partnerId?: string | null | undefined;
      }[],
      UserRoleValue.ADMIN,
    );

    if (!isAdmin) {
      return {
        success: false,
        message: "Not authorized to view notification connections",
        errorCode: 403,
      };
    }

    // Get active connections
    const connections = await notificationService.getActiveConnections();

    // Format the response
    const formattedConnections = connections.map((connection) => ({
      connectionId: connection.connectionId,
      userId: connection.userId,
      deviceId: connection.deviceId,
      subscribedChannels: connection.subscribedChannels,
      connectedAt: connection.connectedAt.getTime(),
      lastActivity: connection.lastActivity.getTime(),
      userAgent: connection.userAgent,
      ipAddress: connection.ipAddress,
    }));

    return formatResponse({
      connections: formattedConnections,
    });
  } catch (error) {
    errorLogger("Error getting notification connections", error);
    return {
      success: false,
      message: "Failed to get notification connections",
      errorCode: 500,
    };
  }
};
