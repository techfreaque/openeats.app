/**
 * Favorites API route handlers
 * This file contains the implementation of the API route handlers for favorites
 */

import type { ApiHandlerProps, ApiHandlerResult } from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger } from "next-vibe/shared/utils/logger";
import { ErrorResponseTypes } from "next-vibe/shared/types/response.schema";

import type {
  FavoriteAddType,
  FavoriteRemoveType,
  FavoritesGetType,
  FavoritesResponseType,
} from "./schema";
import { favoritesRepository } from "./repository";

/**
 * Get user favorites
 */
export async function getFavorites(
  props: ApiHandlerProps<FavoritesGetType, Record<string, never>>,
): Promise<ApiHandlerResult<FavoritesResponseType>> {
  try {
    const { user } = props;

    if (!user) {
      return {
        success: false,
        message: "Authentication required",
        errorType: ErrorResponseTypes.HTTP_ERROR,
        errorCode: 401,
      };
    }

    debugLogger("Get favorites request", { userId: user.id });

    const favorites = await favoritesRepository.getUserFavorites(user.id);

    return {
      success: true,
      data: {
        favorites,
      },
    };
  } catch (error) {
    debugLogger("Error getting favorites", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorType: ErrorResponseTypes.HTTP_ERROR,
      errorCode: 500,
    };
  }
}

/**
 * Add restaurant to favorites
 */
export async function addFavorite(
  props: ApiHandlerProps<FavoriteAddType, Record<string, never>>,
): Promise<ApiHandlerResult<FavoritesResponseType>> {
  try {
    const { data, user } = props;

    if (!user) {
      return {
        success: false,
        message: "Authentication required",
        errorType: ErrorResponseTypes.HTTP_ERROR,
        errorCode: 401,
      };
    }

    if (!data || !data.restaurantId) {
      return {
        success: false,
        message: "Restaurant ID is required",
        errorType: ErrorResponseTypes.HTTP_ERROR,
        errorCode: 400,
      };
    }

    debugLogger("Add favorite request", { userId: user.id, restaurantId: data.restaurantId });

    await favoritesRepository.addFavorite(user.id, data.restaurantId);

    const favorites = await favoritesRepository.getUserFavorites(user.id);

    return {
      success: true,
      data: {
        favorites,
      },
    };
  } catch (error) {
    debugLogger("Error adding favorite", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorType: ErrorResponseTypes.HTTP_ERROR,
      errorCode: 500,
    };
  }
}

/**
 * Remove restaurant from favorites
 */
export async function removeFavorite(
  props: ApiHandlerProps<FavoriteRemoveType, Record<string, never>>,
): Promise<ApiHandlerResult<FavoritesResponseType>> {
  try {
    const { data, user } = props;

    if (!user) {
      return {
        success: false,
        message: "Authentication required",
        errorType: ErrorResponseTypes.HTTP_ERROR,
        errorCode: 401,
      };
    }

    if (!data || !data.restaurantId) {
      return {
        success: false,
        message: "Restaurant ID is required",
        errorType: ErrorResponseTypes.HTTP_ERROR,
        errorCode: 400,
      };
    }

    debugLogger("Remove favorite request", { userId: user.id, restaurantId: data.restaurantId });

    await favoritesRepository.removeFavorite(user.id, data.restaurantId);

    const favorites = await favoritesRepository.getUserFavorites(user.id);

    return {
      success: true,
      data: {
        favorites,
      },
    };
  } catch (error) {
    debugLogger("Error removing favorite", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorType: ErrorResponseTypes.HTTP_ERROR,
      errorCode: 500,
    };
  }
}
