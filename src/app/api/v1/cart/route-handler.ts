import { and, eq } from "drizzle-orm";
import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { formatResponse } from "next-vibe/server/endpoints/core/api-response";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { db } from "../../db";
import { menuItems } from "../menu/db";
import { cartRepository } from "./cart.repository";
import type {
  CartItemCreateType,
  CartItemResponseType,
  CartItemUpdateType,
} from "./definition";

/**
 * Get all cart items for the current user
 */
export const getCart: ApiHandlerFunction<
  UndefinedType,
  CartItemResponseType[],
  UndefinedType
> = async ({ user }) => {
  try {
    debugLogger("Getting cart items for user:", user.id);
    const cart = await cartRepository.findByUserIdWithDetails(user.id);

    // Format the response
    const formattedCart = cart.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return formatResponse(formattedCart as CartItemResponseType[]);
  } catch (error) {
    errorLogger("Failed to get cart items:", String(error));
    return {
      success: false,
      message: "Failed to get cart items",
      errorCode: 500,
    };
  }
};

/**
 * Create a new cart item
 */
export const createCart: ApiHandlerFunction<
  CartItemCreateType,
  CartItemResponseType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    const { menuItemId, restaurantId, quantity } = data;

    // Check if menu item exists and is available
    const menuItemResults = await db
      .select()
      .from(menuItems)
      .where(
        and(
          eq(menuItems.id, menuItemId),
          eq(menuItems.partnerId, restaurantId),
          eq(menuItems.published, true),
          eq(menuItems.isAvailable, true),
        ),
      );

    if (!menuItemResults || menuItemResults.length === 0) {
      return {
        success: false,
        message: "Menu item not found or not available",
        errorCode: 404,
      };
    }

    // Add item to cart
    const cartItem = await cartRepository.upsertCartItem(
      user.id,
      menuItemId,
      restaurantId,
      quantity,
    );

    // Get the cart item with details
    const cartItemWithDetails = await cartRepository.findByUserIdWithDetails(
      user.id,
    );
    const itemWithDetails = cartItemWithDetails.find(
      (item) => item.id === cartItem.id,
    );

    if (!itemWithDetails) {
      throw new Error("Failed to retrieve cart item details");
    }

    // Format the response
    const formattedCartItem = {
      ...itemWithDetails,
      createdAt: itemWithDetails.createdAt.toISOString(),
      updatedAt: itemWithDetails.updatedAt.toISOString(),
    };

    debugLogger("Added item to cart:", cartItem.id);

    return formatResponse(formattedCartItem as CartItemResponseType);
  } catch (error) {
    errorLogger("Failed to add item to cart:", String(error));
    return {
      success: false,
      message: "Failed to add item to cart",
      errorCode: 500,
    };
  }
};

/**
 * Update a cart item
 */
export const updateCart: ApiHandlerFunction<
  CartItemUpdateType,
  CartItemResponseType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    const { id, quantity } = data;

    // Check if cart item exists and belongs to the user
    const existingCartItem = await cartRepository.findByIdAndUserId(
      id,
      user.id,
    );

    if (!existingCartItem) {
      return {
        success: false,
        message: "Cart item not found",
        errorCode: 404,
      };
    }

    // Update cart item
    await cartRepository.updateQuantity(id, quantity);

    // Get the updated cart item with details
    const cartItemWithDetails = await cartRepository.findByUserIdWithDetails(
      user.id,
    );
    const updatedCartItem = cartItemWithDetails.find((item) => item.id === id);

    if (!updatedCartItem) {
      throw new Error("Failed to retrieve updated cart item");
    }

    // Format the response
    const formattedCartItem = {
      ...updatedCartItem,
      createdAt: updatedCartItem.createdAt.toISOString(),
      updatedAt: updatedCartItem.updatedAt.toISOString(),
    };

    debugLogger("Updated cart item:", id);

    return formatResponse(formattedCartItem as CartItemResponseType);
  } catch (error) {
    errorLogger("Failed to update cart item:", String(error));
    return {
      success: false,
      message: "Failed to update cart item",
      errorCode: 500,
    };
  }
};

/**
 * Delete a cart item
 */
export const deleteCart: ApiHandlerFunction<
  { id: string },
  UndefinedType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    const { id } = data;

    // Check if cart item exists and belongs to the user
    const existingCartItem = await cartRepository.findByIdAndUserId(
      id,
      user.id,
    );

    if (!existingCartItem) {
      return {
        success: false,
        message: "Cart item not found",
        errorCode: 404,
      };
    }

    // Delete cart item
    const deleted = await cartRepository.delete(id);

    if (!deleted) {
      throw new Error("Failed to delete cart item");
    }

    debugLogger("Deleted cart item:", id);

    return formatResponse(undefined);
  } catch (error) {
    errorLogger("Failed to delete cart item:", String(error));
    return {
      success: false,
      message: "Failed to delete cart item",
      errorCode: 500,
    };
  }
};
