import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { hasRole } from "next-vibe/server/endpoints/data";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { currencyEnum } from "@/app/api/v1/restaurant/db";
import type { Currencies } from "@/translations";

import { userRolesRepository } from "../auth/roles/roles.repository";
import { categoryRepository } from "../category/category.repository";
import { menuRepository } from "../menu/menu.repository";
import type {
  MenuItemCreateType,
  MenuItemResponseType,
  MenuItemSearchType,
} from "../restaurant/schema/menu.schema";

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
  UndefinedType,
  MenuItemResponseType[],
  UndefinedType
> = async ({ user }) => {
  try {
    debugLogger("Getting all menu items");

    // Check if user can see unpublished items
    const userRoles = await userRolesRepository.findByUserId(user.id);
    const canGetUnpublished =
      hasRole(userRoles, UserRoleValue.ADMIN) ||
      hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);

    // Fetch all menu items
    const allMenuItems = await menuRepository.findAll();

    // Filter menu items based on user permissions
    const menuItems = canGetUnpublished
      ? allMenuItems
      : allMenuItems.filter((item) => item.published && item.isAvailable);

    debugLogger("Retrieved menu items", { count: menuItems.length });

    // Add required fields to menu items
    const processedMenuItems = menuItems.map((item) => ({
      ...item,
      isAvailable: item.isAvailable ?? true,
      availableFrom: item.availableFrom ?? null,
      availableTo: item.availableTo ?? null,
      currency: item.currency as Currencies,
    }));

    return {
      success: true,
      data: processedMenuItems as MenuItemResponseType[],
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
export const createMenuItem: ApiHandlerFunction<
  MenuItemCreateType,
  MenuItemResponseType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Creating menu item", {
      userId: user.id,
      restaurantId: data.restaurantId,
      itemName: data.name,
    });

    // Check if restaurant exists and user has permission
    const userRoles = await userRolesRepository.findByUserIdAndPartnerId(
      user.id,
      data.restaurantId,
    );

    const isAdmin = hasRole(userRoles, UserRoleValue.ADMIN);
    const isPartnerAdmin = hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);
    const isPartnerEmployee = hasRole(
      userRoles,
      UserRoleValue.PARTNER_EMPLOYEE,
    );

    if (!isAdmin && !isPartnerAdmin && !isPartnerEmployee) {
      debugLogger("Not authorized to modify this restaurant's menu", {
        userId: user.id,
        restaurantId: data.restaurantId,
      });
      return {
        success: false,
        message: "Not authorized to modify this restaurant's menu",
        errorCode: 403,
      };
    }

    // Check if restaurant exists
    const restaurant = await restaurantRepository.findById(data.restaurantId);

    if (!restaurant) {
      debugLogger("Restaurant not found", { restaurantId: data.restaurantId });
      return {
        success: false,
        message: "Restaurant not found",
        errorCode: 404,
      };
    }

    // Check if category exists
    const category = await categoryRepository.findById(data.categoryId);

    if (!category) {
      debugLogger("Category not found", { categoryId: data.categoryId });
      return {
        success: false,
        message: "Category not found",
        errorCode: 404,
      };
    }

    // Create menu item using the repository
    const menuItemData = {
      name: data.name,
      description: data.description,
      price: data.price,
      taxPercent: data.taxPercent,
      currency: currencyEnum.enumValues[0], // Default currency
      image: data.image ?? "/menu-placeholder.jpg",
      published: data.published,
      isAvailable: data.isAvailable,
      availableFrom: data.availableFrom,
      availableTo: data.availableTo,
      categoryId: data.categoryId,
      restaurantId: data.restaurantId,
    };

    const menuItem = await menuRepository.create(menuItemData);

    debugLogger("Menu item created successfully", { menuItemId: menuItem.id });

    // Add required fields to menu item
    const processedMenuItem = {
      ...menuItem,
      isAvailable: menuItem.isAvailable ?? true,
      availableFrom: menuItem.availableFrom ?? null,
      availableTo: menuItem.availableTo ?? null,
      currency: menuItem.currency as Currencies,
    };

    return {
      success: true,
      data: processedMenuItem as MenuItemResponseType,
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

/**
 * Search menu items
 * @param props - API handler props
 * @returns List of menu items matching search criteria
 */
export const searchMenuItems: ApiHandlerFunction<
  MenuItemSearchType,
  MenuItemResponseType[],
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Searching menu items", {
      userId: user.id,
      searchCriteria: data,
    });

    // Check if user can see unpublished items
    const userRoles = await userRolesRepository.findByUserId(user.id);
    const canGetUnpublished =
      hasRole(userRoles, UserRoleValue.ADMIN) ||
      hasRole(userRoles, UserRoleValue.PARTNER_ADMIN);

    // Log search criteria
    debugLogger("Search criteria", {
      categoryId: data.categoryId,
      restaurantId: data.restaurantId,
      published: data.published,
      minPrice: data.minPrice,
      maxPrice: data.maxPrice,
    });

    // Fetch all menu items
    const allMenuItems = await menuRepository.findAll();

    // Filter menu items based on search criteria
    const menuItems = allMenuItems.filter((item) => {
      // Apply category filter
      if (data.categoryId && item.categoryId !== data.categoryId) {
        return false;
      }

      // Apply restaurant filter
      if (data.restaurantId && item.restaurantId !== data.restaurantId) {
        return false;
      }

      // Apply published filter
      if (!canGetUnpublished && (!item.published || !item.isAvailable)) {
        return false;
      } else if (data.published != null && item.published !== data.published) {
        return false;
      }

      // Apply price filters
      if (data.minPrice != null && item.price < data.minPrice) {
        return false;
      }

      if (data.maxPrice != null && item.price > data.maxPrice) {
        return false;
      }

      return true;
    });

    // Sort menu items by name
    menuItems.sort((a, b) => a.name.localeCompare(b.name));

    debugLogger("Retrieved menu items", { count: menuItems.length });

    // Add required fields to menu items
    const processedMenuItems = menuItems.map((item) => ({
      ...item,
      isAvailable: item.isAvailable ?? true,
      availableFrom: item.availableFrom ?? null,
      availableTo: item.availableTo ?? null,
      currency: item.currency as Currencies,
    }));

    return {
      success: true,
      data: processedMenuItems as MenuItemResponseType[],
    };
  } catch (error) {
    debugLogger("Error searching menu items", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error searching menu items",
      errorCode: 500,
    };
  }
};
