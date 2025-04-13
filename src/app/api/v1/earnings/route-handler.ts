import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { db } from "../../../../packages/next-vibe/server/db";
import type {
  EarningCreateType,
  EarningResponseType,
  EarningsResponseType,
} from "./schema";

/**
 * Earnings API route handlers
 * Provides driver earnings management functionality
 */

/**
 * Get driver earnings
 * @param props - API handler props
 * @returns List of earnings
 */
export const getEarnings: ApiHandlerFunction<
  UndefinedType,
  EarningsResponseType,
  UndefinedType
> = async ({ user }) => {
  try {
    debugLogger("Getting earnings", { userId: user.id });

    // Check if user is a driver
    const userRoles = await db.userRole.findMany({
      where: { userId: user.id },
    });

    const isDriver = hasRole(userRoles, UserRoleValue.COURIER);
    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);

    if (!isDriver && !isAdmin) {
      debugLogger("User is not a driver or admin", { userId: user.id });
      return {
        success: false,
        message: "Only drivers can access earnings",
        errorCode: 403,
      };
    }

    // If user is a driver, get their earnings
    // If user is an admin, they can see all earnings
    const earnings = await db.earning.findMany({
      where: isAdmin ? {} : { userId: user.id },
      orderBy: { date: "desc" },
    });

    // Format dates for response
    const formattedEarnings = earnings.map((earning) => ({
      ...earning,
      date: earning.date.toISOString(),
      createdAt: earning.createdAt.toISOString(),
    }));

    debugLogger("Retrieved earnings", { count: formattedEarnings.length });

    return {
      success: true,
      data: formattedEarnings,
    };
  } catch (error) {
    debugLogger("Error getting earnings", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error getting earnings",
      errorCode: 500,
    };
  }
};

/**
 * Create a new earning record
 * @param props - API handler props
 * @returns Created earning
 */
export const createEarning: ApiHandlerFunction<
  EarningCreateType,
  EarningResponseType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Creating earning", {
      adminUserId: user.id,
      driverUserId: data.userId,
    });

    // Check if user has admin role
    const userRoles = await db.userRole.findMany({
      where: { userId: user.id },
    });

    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);

    if (!isAdmin) {
      debugLogger("Unauthorized attempt to create earning", {
        userId: user.id,
      });
      return {
        success: false,
        message: "Admin access required",
        errorCode: 403,
      };
    }

    // Check if user exists
    const userExists = await db.user.findUnique({
      where: { id: data.userId },
    });

    if (!userExists) {
      debugLogger("User not found", { userId: data.userId });
      return {
        success: false,
        message: "User not found",
        errorCode: 404,
      };
    }

    // Create earning record
    const earning = await db.earning.create({
      data: {
        userId: data.userId,
        date: new Date(data.date),
        amount: data.amount,
        deliveries: data.deliveries,
      },
    });

    debugLogger("Earning created successfully", { earningId: earning.id });

    return {
      success: true,
      data: {
        ...earning,
        date: earning.date.toISOString(),
        createdAt: earning.createdAt.toISOString(),
      },
    };
  } catch (error) {
    debugLogger("Error creating earning", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error creating earning",
      errorCode: 500,
    };
  }
};
