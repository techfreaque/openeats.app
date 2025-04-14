import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { z } from "zod";

import {
  FavoriteAddSchema,
  FavoriteRemoveSchema,
  FavoritesGetSchema,
  FavoritesResponseSchema,
} from "./schema";

/**
 * GET endpoint for retrieving user favorites
 */
const getFavoritesEndpoint = createEndpoint({
  description: "Get user favorites",
  method: Methods.GET,
  requestSchema: FavoritesGetSchema,
  responseSchema: FavoritesResponseSchema,
  requestUrlSchema: z.object({}),
  fieldDescriptions: {
    userId: "Optional user ID to get favorites for. If not provided, uses the authenticated user.",
  },
  apiQueryOptions: {
    queryKey: ["favorites"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    401: "Not authenticated",
    403: "Insufficient permissions",
    500: "Internal server error",
  },
  path: ["favorites"],
  examples: {
    urlPathVariables: {
      default: {},
    },
    payloads: {
      default: {},
    },
    responses: {
      default: {
        favorites: ["restaurant-id-1", "restaurant-id-2"],
      },
    },
  },
});

/**
 * POST endpoint for adding a restaurant to favorites
 */
const addFavoriteEndpoint = createEndpoint({
  description: "Add restaurant to favorites",
  method: Methods.POST,
  requestSchema: FavoriteAddSchema,
  responseSchema: FavoritesResponseSchema,
  requestUrlSchema: z.object({}),
  fieldDescriptions: {
    restaurantId: "Restaurant ID to add to favorites",
  },
  apiQueryOptions: {
    queryKey: ["favorites", "add"],
    staleTime: 0, // Don't cache mutations
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    404: "Restaurant not found",
    500: "Internal server error",
  },
  path: ["favorites"],
  examples: {
    urlPathVariables: {
      default: {},
    },
    payloads: {
      default: {
        restaurantId: "restaurant-id-1",
      },
    },
    responses: {
      default: {
        favorites: ["restaurant-id-1"],
      },
    },
  },
});

/**
 * DELETE endpoint for removing a restaurant from favorites
 */
const removeFavoriteEndpoint = createEndpoint({
  description: "Remove restaurant from favorites",
  method: Methods.DELETE,
  requestSchema: FavoriteRemoveSchema,
  responseSchema: FavoritesResponseSchema,
  requestUrlSchema: z.object({}),
  fieldDescriptions: {
    restaurantId: "Restaurant ID to remove from favorites",
  },
  apiQueryOptions: {
    queryKey: ["favorites", "remove"],
    staleTime: 0, // Don't cache mutations
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Insufficient permissions",
    404: "Restaurant not found",
    500: "Internal server error",
  },
  path: ["favorites"],
  examples: {
    urlPathVariables: {
      default: {},
    },
    payloads: {
      default: {
        restaurantId: "restaurant-id-1",
      },
    },
    responses: {
      default: {
        favorites: [],
      },
    },
  },
});

/**
 * Export all favorites endpoints
 */
const favoritesEndpoints = {
  ...getFavoritesEndpoint,
  ...addFavoriteEndpoint,
  ...removeFavoriteEndpoint,
};

export default favoritesEndpoints;
