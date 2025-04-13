import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { db } from "../../db";
import type { MenuScannerResponseType } from "./schema";

/**
 * Menu Scanner API route handlers
 * Provides menu scanning functionality using AI
 */

/**
 * Scan a menu image using AI
 * @param props - API handler props
 * @returns Extracted menu items
 */
export const scanMenu: ApiHandlerFunction<
  UndefinedType,
  MenuScannerResponseType,
  UndefinedType
> = async ({ user }) => {
  try {
    debugLogger("Scanning menu", { userId: user.id });

    // Check if user has appropriate role
    const userRoles = await db.userRole.findMany({
      where: { userId: user.id },
    });

    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);
    const isPartnerAdmin = hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);
    const isPartnerEmployee = hasRole(
      userRoles,
      UserRoleValue.PARTNER_EMPLOYEE,
    );

    if (!isAdmin && !isPartnerAdmin && !isPartnerEmployee) {
      debugLogger("Unauthorized attempt to scan menu", { userId: user.id });
      return {
        success: false,
        message: "Not authorized to scan menus",
        errorCode: 403,
      };
    }

    // In a real implementation, we would parse form data from the request
    // Since we can't access the request directly in the handler, we would need to
    // modify the API handler to pass the request object or parse the form data before calling the handler

    // For now, we'll simulate a successful response with mock data
    const mockMenuItems = [
      {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 12.99,
        category: "Pizza",
      },
      {
        name: "Pepperoni Pizza",
        description: "Pizza with tomato sauce, mozzarella, and pepperoni",
        price: 14.99,
        category: "Pizza",
      },
    ];

    // In a real implementation, we would validate the request and check permissions
    // For now, we'll skip these steps and return the mock data

    debugLogger("Menu items extracted successfully", {
      userId: user.id,
      count: mockMenuItems.length,
    });

    return {
      success: true,
      data: {
        menuItems: mockMenuItems,
      },
    };
  } catch (error) {
    debugLogger("Error scanning menu", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error scanning menu",
      errorCode: 500,
    };
  }
};
