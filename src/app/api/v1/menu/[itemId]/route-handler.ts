import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { Currencies } from "@/translations";

import { db } from "../../../db";
import type {
  MenuItemResponseType,
  MenuItemUpdateType,
} from "../../restaurant/schema/menu.schema";

/**
 * Menu Item Detail API route handlers
 * Provides menu item detail management functionality
 */

/**
 * Get a specific menu item by ID
 * @param props - API handler props
 * @returns Menu item details
 */
export const getMenuItem: ApiHandlerFunction<
  UndefinedType,
  MenuItemResponseType,
  { itemId: string }
> = async ({ urlVariables, user }) => {
  try {
    const { itemId } = urlVariables;
    debugLogger("Getting menu item", { itemId });

    // Check if user can see unpublished items
    const userRoles = await db.userRole.findMany({
      where: { userId: user.id },
    });
    const canGetUnpublished =
      hasRole(userRoles, UserRoleValue.ADMIN) ||
      hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);

    // Fetch menu item
    const menuItem = await db.menuItem.findUnique({
      where: {
        id: itemId,
        ...(canGetUnpublished ? {} : { published: true, isAvailable: true }),
      },
      include: {
        category: true,
      },
    });

    if (!menuItem) {
      debugLogger("Menu item not found", { itemId });
      return {
        success: false,
        message: "Menu item not found",
        errorCode: 404,
      };
    }

    debugLogger("Retrieved menu item", { menuItemId: menuItem.id });

    // Add isAvailable flag if not present
    const menuItemWithAvailability = {
      ...menuItem,
      isAvailable: menuItem.isAvailable ?? true,
      availableFrom: menuItem.availableFrom ?? null,
      availableTo: menuItem.availableTo ?? null,
      currency: menuItem.currency as Currencies,
    };

    return {
      success: true,
      data: menuItemWithAvailability as MenuItemResponseType,
    };
  } catch (error) {
    debugLogger("Error getting menu item", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error getting menu item",
      errorCode: 500,
    };
  }
};

/**
 * Update a specific menu item
 * @param props - API handler props
 * @returns Updated menu item
 */
export const updateMenuItem: ApiHandlerFunction<
  MenuItemUpdateType,
  MenuItemResponseType,
  { itemId: string }
> = async ({ data, urlVariables, user }) => {
  try {
    const { itemId } = urlVariables;
    debugLogger("Updating menu item", {
      userId: user.id,
      menuItemId: itemId,
      restaurantId: data.restaurantId,
    });

    // Check if menu item exists
    const menuItem = await db.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!menuItem) {
      debugLogger("Menu item not found", { itemId });
      return {
        success: false,
        message: "Menu item not found",
        errorCode: 404,
      };
    }

    // Check if user has permission to update this menu item
    const userRoles = await db.userRole.findMany({
      where: {
        userId: user.id,
        partnerId: menuItem.restaurantId,
      },
    });

    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);
    const isPartnerAdmin = hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);
    const isPartnerEmployee = hasRole(
      userRoles,
      UserRoleValue.PARTNER_EMPLOYEE,
    );

    if (!isAdmin && !isPartnerAdmin && !isPartnerEmployee) {
      debugLogger("Not authorized to modify this menu item", {
        userId: user.id,
        menuItemId: itemId,
        restaurantId: menuItem.restaurantId,
      });
      return {
        success: false,
        message: "Not authorized to modify this menu item",
        errorCode: 403,
      };
    }

    // Check if category exists
    if (data.categoryId) {
      const category = await db.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        debugLogger("Category not found", { categoryId: data.categoryId });
        return {
          success: false,
          message: "Category not found",
          errorCode: 404,
        };
      }
    }

    // Update menu item
    const updatedMenuItem = await db.menuItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        taxPercent: data.taxPercent,
        currency: data.currency,
        image: data.image,
        published: data.published,
        isAvailable: data.isAvailable,
        availableFrom: data.availableFrom,
        availableTo: data.availableTo,
        categoryId: data.categoryId,
      },
      include: {
        category: true,
      },
    });

    debugLogger("Menu item updated successfully", {
      menuItemId: updatedMenuItem.id,
    });

    // Add isAvailable flag if not present
    const menuItemWithAvailability = {
      ...updatedMenuItem,
      isAvailable: updatedMenuItem.isAvailable ?? true,
      availableFrom: updatedMenuItem.availableFrom ?? null,
      availableTo: updatedMenuItem.availableTo ?? null,
      currency: updatedMenuItem.currency as Currencies,
    };

    return {
      success: true,
      data: menuItemWithAvailability as MenuItemResponseType,
    };
  } catch (error) {
    debugLogger("Error updating menu item", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error updating menu item",
      errorCode: 500,
    };
  }
};

/**
 * Delete a specific menu item
 * @param props - API handler props
 * @returns Success status
 */
export const deleteMenuItem: ApiHandlerFunction<
  UndefinedType,
  { success: boolean },
  { itemId: string }
> = async ({ urlVariables, user }) => {
  try {
    const { itemId } = urlVariables;
    debugLogger("Deleting menu item", {
      userId: user.id,
      menuItemId: itemId,
    });

    // Check if menu item exists
    const menuItem = await db.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!menuItem) {
      debugLogger("Menu item not found", { itemId });
      return {
        success: false,
        message: "Menu item not found",
        errorCode: 404,
      };
    }

    // Check if user has permission to delete this menu item
    const userRoles = await db.userRole.findMany({
      where: {
        userId: user.id,
        partnerId: menuItem.restaurantId,
      },
    });

    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);
    const isPartnerAdmin = hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);
    const isPartnerEmployee = hasRole(
      userRoles,
      UserRoleValue.PARTNER_EMPLOYEE,
    );

    if (!isAdmin && !isPartnerAdmin && !isPartnerEmployee) {
      debugLogger("Not authorized to delete this menu item", {
        userId: user.id,
        menuItemId: itemId,
        restaurantId: menuItem.restaurantId,
      });
      return {
        success: false,
        message: "Not authorized to delete this menu item",
        errorCode: 403,
      };
    }

    // Delete menu item
    await db.menuItem.delete({
      where: { id: itemId },
    });

    debugLogger("Menu item deleted successfully", { menuItemId: itemId });

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    debugLogger("Error deleting menu item", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error deleting menu item",
      errorCode: 500,
    };
  }
};
