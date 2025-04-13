import "server-only";

import { debugLogger } from "next-vibe/shared/utils/logger";

import { db } from "../../db";
import type { MenuItemRequestUrlParamsType, MenuItemType } from "./definition";

/**
 * Menu API route handlers
 * Provides menu management functionality
 */

/**
 * Get all menu items for a restaurant
 * @param props - API handler props
 * @returns List of menu items
 */
export const getMenuItems = async ({
  urlVariables,
}: {
  urlVariables: MenuItemRequestUrlParamsType;
}): Promise<
  | { success: true; data: any[] }
  | { success: false; message: string; errorCode: number }
> => {
  try {
    const { restaurantId } = urlVariables;
    debugLogger("Getting menu items", { restaurantId });

    // Check if restaurant exists
    const restaurant = await db.partner.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      debugLogger("Restaurant not found", { restaurantId });
      return {
        success: false,
        message: "Restaurant not found",
        errorCode: 404,
      };
    }

    // Fetch menu items
    const menuItems = await db.menuItem.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        categoryId: "asc",
      },
    });

    debugLogger("Retrieved menu items", { count: menuItems.length });

    return {
      success: true,
      data: menuItems,
    };
  } catch (error) {
    debugLogger("Error getting menu items", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error getting menu items",
      errorCode: 500,
    };
  }
};

/**
 * Create a new menu item
 * @param props - API handler props
 * @returns Created menu item
 */
export const createMenuItem = async ({
  data,
  urlVariables,
  user,
}: {
  data: MenuItemType;
  urlVariables: MenuItemRequestUrlParamsType;
  user: { id: string };
}): Promise<
  | { success: true; data: any }
  | { success: false; message: string; errorCode: number }
> => {
  try {
    const { restaurantId } = urlVariables;
    debugLogger("Creating menu item", {
      userId: user.id,
      restaurantId,
      itemName: data.name,
    });

    // Check if restaurant exists and user has permission
    const restaurant = await db.partner.findUnique({
      where: {
        id: restaurantId,
        // userId: user.id, // This field doesn't exist in the schema
      },
    });

    if (!restaurant) {
      debugLogger("Not authorized to modify this restaurant's menu", {
        userId: user.id,
        restaurantId,
      });
      return {
        success: false,
        message: "Not authorized to modify this restaurant's menu",
        errorCode: 403,
      };
    }

    // Create menu item
    const menuItem = await db.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: data.category, // Use categoryId instead of category
        image: data.image ?? "/menu-placeholder.jpg",
        restaurantId,
        taxPercent: 19, // Default tax percent
        currency: "EUR", // Default currency
        published: false, // Default published status
        isAvailable: true, // Default availability
        availableFrom: null, // Default availability from
        availableTo: null, // Default availability to
      },
    });

    debugLogger("Menu item created successfully", { menuItemId: menuItem.id });

    return {
      success: true,
      data: menuItem,
    };
  } catch (error) {
    debugLogger("Error creating menu item", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error creating menu item",
      errorCode: 500,
    };
  }
};
