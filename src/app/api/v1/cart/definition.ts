import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

/**
 * Cart API endpoints
 * This file defines all the endpoints for the cart API
 */

// Import schemas from schema.ts
import {
  cartItemCreateSchema,
  cartItemUpdateSchema,
  cartItemResponseSchema,
  cartItemUrlParamsSchema,
} from "./schema";

// Export types for use in other files
export type CartItemCreateType = z.infer<typeof cartItemCreateSchema>;
export type CartItemUpdateType = z.infer<typeof cartItemUpdateSchema>;
export type CartItemResponseType = z.infer<typeof cartItemResponseSchema>;
export type CartItemUrlParamsType = z.infer<typeof cartItemUrlParamsSchema>;

// Example data for documentation and testing
const exampleCartItem = {
  id: uuidv4(),
  menuItemId: "menu-item-id-1",
  partnerId: "restaurant-id-1",
  userId: "user-id-1",
  quantity: 2,
  notes: "No onions please",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * GET endpoint for retrieving cart items
 * Returns all cart items for the current user
 */
const cartGetEndpoint = createEndpoint({
  description: "Get all cart items for the current user",
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: z.array(cartItemResponseSchema),
  requestUrlSchema: undefinedSchema,
  path: ["v1", "cart"],
  apiQueryOptions: {
    queryKey: ["cart-items"],
  },
  fieldDescriptions: undefined,
  allowedRoles: [UserRoleValue.CUSTOMER],
  errorCodes: {
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: undefined,
    responses: {
      default: [exampleCartItem],
    },
  },
});

/**
 * POST endpoint for adding items to cart
 * Creates a new cart item for the current user
 */
const cartAddEndpoint = createEndpoint({
  description: "Add an item to the cart",
  method: Methods.POST,
  requestSchema: cartItemCreateSchema,
  responseSchema: cartItemResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "cart"],
  apiQueryOptions: {
    queryKey: ["cart-add"],
  },
  fieldDescriptions: {
    menuItemId: "ID of the menu item to add",
    restaurantId: "ID of the restaurant the menu item belongs to",
    quantity: "Quantity of the menu item to add",
  },
  allowedRoles: [UserRoleValue.CUSTOMER],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    404: "Menu item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        menuItemId: "menu-item-id-1",
        restaurantId: "restaurant-id-1",
        quantity: 2,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: exampleCartItem,
    },
  },
});

/**
 * PUT endpoint for updating cart items
 * Updates an existing cart item for the current user
 */
const cartUpdateEndpoint = createEndpoint({
  description: "Update a cart item",
  method: Methods.PUT,
  requestSchema: cartItemUpdateSchema,
  responseSchema: cartItemResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "cart"],
  apiQueryOptions: {
    queryKey: ["cart-update"],
  },
  fieldDescriptions: {
    id: "ID of the cart item to update",
    quantity: "New quantity for the cart item",
  },
  allowedRoles: [UserRoleValue.CUSTOMER],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    404: "Cart item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "cart-item-id-1",
        quantity: 3,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        ...exampleCartItem,
        quantity: 3,
      },
    },
  },
});

/**
 * DELETE endpoint for removing cart items
 * Removes a cart item for the current user
 */
const cartDeleteEndpoint = createEndpoint({
  description: "Remove a cart item",
  method: Methods.DELETE,
  requestSchema: z.object({
    id: z.string().uuid({ message: "Valid cart item ID is required" }),
  }),
  responseSchema: undefinedSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "cart"],
  apiQueryOptions: {
    queryKey: ["cart-delete"],
  },
  fieldDescriptions: {
    id: "ID of the cart item to remove",
  },
  allowedRoles: [UserRoleValue.CUSTOMER],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    404: "Cart item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "cart-item-id-1",
      },
    },
    urlPathVariables: undefined,
    responses: undefined,
  },
});

/**
 * Cart API endpoints
 * Combines all cart endpoints into a single object
 */
const cartEndpoints = {
  ...cartGetEndpoint,
  ...cartAddEndpoint,
  ...cartUpdateEndpoint,
  ...cartDeleteEndpoint,
};

export default cartEndpoints;
