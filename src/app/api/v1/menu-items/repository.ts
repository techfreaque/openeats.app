import "server-only";

import type { JwtPayloadType } from "next-vibe/server/endpoints/auth/jwt";
import { errorLogger } from "next-vibe/shared/utils/logger";

import type {
  MenuItemCreateType,
  MenuItemResponseType,
  MenuItemUpdateType,
} from "../restaurant/schema/menu.schema";

/**
 * Get menu items with optional filtering
 * @param params Filter parameters
 * @param user Authenticated user (optional)
 * @returns Array of menu items
 */
export async function getMenuItems(
  params: { restaurantId?: string; categoryId?: string; id?: string },
  user?: JwtPayloadType,
): Promise<MenuItemResponseType[]> {
  try {
    const mockMenuItems: MenuItemResponseType[] = [
      {
        id: "menu-item-id-1",
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 12.99,
        taxPercent: 19,
        currency: "EUR",
        image: "/menu-placeholder.jpg",
        published: true,
        isAvailable: true,
        availableFrom: null,
        availableTo: null,
        restaurantId: "restaurant-id-1",
        category: {
          id: "category-id-1",
          name: "Pizza",
          image: "/placeholder.svg",
          published: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "menu-item-id-2",
        name: "Pepperoni Pizza",
        description: "Pizza with tomato sauce, mozzarella, and pepperoni",
        price: 14.99,
        taxPercent: 19,
        currency: "EUR",
        image: "/menu-placeholder.jpg",
        published: true,
        isAvailable: true,
        availableFrom: null,
        availableTo: null,
        restaurantId: "restaurant-id-1",
        category: {
          id: "category-id-1",
          name: "Pizza",
          image: "/placeholder.svg",
          published: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "menu-item-id-3",
        name: "Veggie Burger",
        description:
          "Plant-based burger with lettuce, tomato, and special sauce",
        price: 10.99,
        taxPercent: 19,
        currency: "EUR",
        image: "/menu-placeholder.jpg",
        published: true,
        isAvailable: true,
        availableFrom: null,
        availableTo: null,
        restaurantId: "restaurant-id-2",
        category: {
          id: "category-id-2",
          name: "Burgers",
          image: "/placeholder.svg",
          published: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let filteredItems = [...mockMenuItems];

    if (params.restaurantId) {
      filteredItems = filteredItems.filter(
        (item) => item.restaurantId === params.restaurantId,
      );
    }

    if (params.categoryId) {
      filteredItems = filteredItems.filter(
        (item) => item.category.id === params.categoryId,
      );
    }

    if (params.id) {
      filteredItems = filteredItems.filter((item) => item.id === params.id);
    }

    return filteredItems;
  } catch (error) {
    errorLogger("Error getting menu items:", error);
    throw error;
  }
}

/**
 * Create a new menu item
 * @param data Menu item data
 * @param user Authenticated user
 * @returns Created menu item
 */
export async function createMenuItem(
  data: MenuItemCreateType,
  user: JwtPayloadType,
): Promise<MenuItemResponseType> {
  try {
    const newMenuItem: MenuItemResponseType = {
      id: `menu-item-id-${Date.now()}`,
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
      restaurantId: data.restaurantId,
      category: {
        id: data.categoryId,
        name: "Category Name", // In production, this would be fetched from the database
        image: "/placeholder.svg",
        published: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newMenuItem;
  } catch (error) {
    errorLogger("Error creating menu item:", error);
    throw error;
  }
}

/**
 * Update an existing menu item
 * @param data Menu item data with ID
 * @param user Authenticated user
 * @returns Updated menu item
 */
export async function updateMenuItem(
  data: MenuItemUpdateType,
  user: JwtPayloadType,
): Promise<MenuItemResponseType> {
  try {
    const existingItems = await getMenuItems({ id: data.id }, user);
    if (existingItems.length === 0) {
      throw new Error("Menu item not found");
    }

    const updatedMenuItem: MenuItemResponseType = {
      id: data.id,
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
      restaurantId: data.restaurantId,
      category: {
        id: data.categoryId,
        name: "Category Name", // In production, this would be fetched from the database
        image: "/placeholder.svg",
        published: true,
      },
      createdAt: existingItems[0].createdAt,
      updatedAt: new Date(),
    };

    return updatedMenuItem;
  } catch (error) {
    errorLogger("Error updating menu item:", error);
    throw error;
  }
}

/**
 * Delete a menu item
 * @param id Menu item ID
 * @param user Authenticated user
 */
export async function deleteMenuItem(
  id: string,
  user: JwtPayloadType,
): Promise<void> {
  try {
    const existingItems = await getMenuItems({ id }, user);
    if (existingItems.length === 0) {
      throw new Error("Menu item not found");
    }
  } catch (error) {
    errorLogger("Error deleting menu item:", error);
    throw error;
  }
}
