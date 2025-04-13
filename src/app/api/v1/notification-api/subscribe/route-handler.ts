/**
 * Notification subscribe API route handler
 * Provides functionality for subscribing to notification channels
 */

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { formatResponse } from "next-vibe/server/endpoints/core/api-response";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import {
  notificationConnectionRepository,
  notificationSubscriptionRepository,
} from "../notification.repository";
import type {
  NotificationSubscribeRequestType,
  NotificationSubscribeRequestUrlParamsType,
  NotificationSubscribeResponseOutputType,
} from "../schema";

/**
 * Subscribe to notification channels
 * @param props - API handler props
 * @returns Result of the subscription
 */
export const subscribeToChannels: ApiHandlerFunction<
  NotificationSubscribeRequestType,
  NotificationSubscribeResponseOutputType,
  NotificationSubscribeRequestUrlParamsType
> = async ({ data, user, urlParams }) => {
  try {
    const { channels, deviceId } = data;
    const { userId } = urlParams ?? {};

    debugLogger("Subscribing to notification channels", {
      channels,
      deviceId,
      userId: userId ?? user.id,
    });

    // Create a unique connection ID
    const connectionId = `${deviceId}-${Date.now()}`;

    // Create a connection record
    await notificationConnectionRepository.createConnection({
      connectionId,
      userId: userId ?? user.id,
      deviceId,
      connectedAt: new Date(),
      lastActivity: new Date(),
    });

    // Subscribe to channels
    const subscriptions =
      await notificationSubscriptionRepository.subscribeToChannels(
        connectionId,
        channels,
      );

    // Extract channel names from subscriptions
    const subscribedChannels = subscriptions.map((sub) => {
      // Type assertion to ensure we have the correct structure
      const typedSub = sub as { channel: string };
      return typedSub.channel;
    });

    return formatResponse({
      success: true,
      connectionId,
      subscribedChannels,
    });
  } catch (error) {
    errorLogger("Error subscribing to notification channels", error);
    return {
      success: false,
      message: "Failed to subscribe to notification channels",
      errorCode: 500,
    };
  }
};
