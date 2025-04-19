import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { ErrorResponseTypes } from "next-vibe/shared/types/response.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import type {
  MenuItemCreateType,
  MenuItemResponseType,
  MenuItemSearchType,
  MenuItemUpdateType,
} from "../restaurant/schema/menu.schema";
import {
  createMenuItem as createMenuItemRepo,
  deleteMenuItem as deleteMenuItemRepo,
  getMenuItems as getMenuItemsRepo,
  updateMenuItem as updateMenuItemRepo,
} from "./repository";

/**
 * Menu Items API route handlers
 * Provides menu items management functionality
 */

/**
 * Get all menu items
 * @param props - API handler props
 * @returns List of menu items
 */
export const getMenuItems: ApiHandlerFunction<
  { restaurantId?: string; categoryId?: string; id?: string },
  MenuItemResponseType[],
  Record<string, never>
> = async ({ data, user }) => {
  try {
    debugLogger("Getting menu items", { params: data });

    const menuItems = await getMenuItemsRepo(data || {}, user);

    return {
      success: true,
      data: menuItems,
    };
  } catch (error) {
    errorLogger("Error getting menu items:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve menu items",
      errorType: ErrorResponseTypes.INTERNAL_ERROR,
    };
  }
};

/**
 * Create a new menu item
 * @param props - API handler props
 * @returns Created menu item
 */
export const createMenuItem: ApiHandlerFunction<
  MenuItemCreateType,
  MenuItemResponseType,
  Record<string, never>
> = async ({ data, user }) => {
  if (!user) {
    return {
      success: false,
      message: "Authentication required",
      errorType: ErrorResponseTypes.AUTH_ERROR,
    };
  }

  try {
    debugLogger("Creating menu item", {
      userId: user.id,
      restaurantId: data.restaurantId,
      itemName: data.name,
    });

    const newItem = await createMenuItemRepo(data, user);

    return {
      success: true,
      data: newItem,
    };
  } catch (error) {
    errorLogger("Error creating menu item:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create menu item",
      errorType: ErrorResponseTypes.INTERNAL_ERROR,
    };
  }
};

/**
 * Update a menu item
 * @param props - API handler props
 * @returns Updated menu item
 */
export const updateMenuItem: ApiHandlerFunction<
  MenuItemUpdateType,
  MenuItemResponseType,
  Record<string, never>
> = async ({ data, user }) => {
  if (!user) {
    return {
      success: false,
      message: "Authentication required",
      errorType: ErrorResponseTypes.AUTH_ERROR,
    };
  }

  try {
    debugLogger("Updating menu item", {
      userId: user.id,
      menuItemId: data.id,
      restaurantId: data.restaurantId,
    });

    const updatedItem = await updateMenuItemRepo(data, user);

    return {
      success: true,
      data: updatedItem,
    };
  } catch (error) {
    errorLogger("Error updating menu item:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update menu item",
      errorType: ErrorResponseTypes.INTERNAL_ERROR,
    };
  }
};

/**
 * Delete a menu item
 * @param props - API handler props
 * @returns Deletion status
 */
export const deleteMenuItem: ApiHandlerFunction<
  { id: string },
  { deleted: boolean },
  Record<string, never>
> = async ({ data, user }) => {
  if (!user) {
    return {
      success: false,
      message: "Authentication required",
      errorType: ErrorResponseTypes.AUTH_ERROR,
    };
  }

  try {
    debugLogger("Deleting menu item", {
      userId: user.id,
      menuItemId: data.id,
    });

    await deleteMenuItemRepo(data.id, user);

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    errorLogger("Error deleting menu item:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete menu item",
      errorType: ErrorResponseTypes.INTERNAL_ERROR,
    };
  }
};

/**
 * Search menu items
 * @param props - API handler props
 * @returns List of menu items matching search criteria
 */
export const searchMenuItems: ApiHandlerFunction<
  MenuItemSearchType,
  MenuItemResponseType[],
  Record<string, never>
> = async ({ data, user }) => {
  try {
    debugLogger("Searching menu items", {
      userId: user?.id,
      searchCriteria: data,
    });

    const menuItems = await getMenuItemsRepo(
      {
        restaurantId: data.restaurantId || undefined,
        categoryId: data.categoryId || undefined,
      },
      user,
    );

    // Apply additional filters that aren't handled by the repository
    let filteredItems = menuItems;

    if (data.published !== null && data.published !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.published === data.published,
      );
    }

    if (data.minPrice !== null && data.minPrice !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.price >= data.minPrice!,
      );
    }

    if (data.maxPrice !== null && data.maxPrice !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.price <= data.maxPrice!,
      );
    }

    return {
      success: true,
      data: filteredItems,
    };
  } catch (error) {
    errorLogger("Error searching menu items:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to search menu items",
      errorType: ErrorResponseTypes.INTERNAL_ERROR,
    };
  }
};
