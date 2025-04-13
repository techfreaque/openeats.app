import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { z } from "zod";

import { Currencies } from "@/translations";

import {
  menuItemResponseSchema,
  menuItemUpdateSchema,
} from "../../restaurant/schema/menu.schema";

/**
 * Menu Item Detail API endpoint definitions
 * Provides menu item detail management functionality
 */

// URL parameters schema
const menuItemUrlParamsSchema = z.object({
  itemId: z.string().uuid(),
});

// Example data
const exampleMenuItem = {
  id: "menu-item-id-1",
  name: "Margherita Pizza",
  description: "Classic pizza with tomato sauce, mozzarella, and basil",
  price: 12.99,
  taxPercent: 19,
  currency: Currencies.EUR,
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// GET endpoint for retrieving a specific menu item
const menuItemGetEndpoint = createEndpoint({
  description: "Get a specific menu item by ID",
  method: Methods.GET,
  requestSchema: z.object({}),
  responseSchema: menuItemResponseSchema,
  requestUrlSchema: menuItemUrlParamsSchema,
  path: ["v1", "menu", "{itemId}"],
  apiQueryOptions: {
    queryKey: ["menu-item", "{itemId}"],
  },
  fieldDescriptions: {
    itemId: "ID of the menu item to retrieve",
  },
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    404: "Menu item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {},
    },
    urlPathVariables: {
      default: {
        itemId: "menu-item-id-1",
      },
    },
    responses: {
      default: exampleMenuItem,
    },
  },
});

// PUT endpoint for updating a menu item
const menuItemUpdateEndpoint = createEndpoint({
  description: "Update a specific menu item",
  method: Methods.PUT,
  requestSchema: menuItemUpdateSchema,
  responseSchema: menuItemResponseSchema,
  requestUrlSchema: menuItemUrlParamsSchema,
  path: ["v1", "menu", "{itemId}"],
  apiQueryOptions: {
    queryKey: ["update-menu-item", "{itemId}"],
  },
  fieldDescriptions: {
    id: "ID of the menu item",
    createdAt: "Creation date",
    updatedAt: "Last update date",
    itemId: "ID of the menu item to update",
    name: "Name of the menu item",
    description: "Description of the menu item",
    price: "Price of the menu item",
    taxPercent: "Tax percentage for the menu item",
    currency: "Currency for the menu item",
    image: "Image URL for the menu item",
    published: "Whether the menu item is published",
    isAvailable: "Whether the menu item is available",
    availableFrom: "Date from which the menu item is available",
    availableTo: "Date until which the menu item is available",
    categoryId: "ID of the category this menu item belongs to",
    restaurantId: "ID of the restaurant this menu item belongs to",
  },

  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized to modify this menu item",
    404: "Menu item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "menu-item-id-1",
        name: "Updated Pizza",
        description: "Updated description",
        price: 14.99,
        taxPercent: 19,
        currency: Currencies.EUR,
        image: "/menu-placeholder.jpg",
        published: true,
        isAvailable: true,
        availableFrom: null,
        availableTo: null,
        categoryId: "category-id-1",
        restaurantId: "restaurant-id-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    urlPathVariables: {
      default: {
        itemId: "menu-item-id-1",
      },
    },
    responses: {
      default: {
        ...exampleMenuItem,
        name: "Updated Pizza",
        description: "Updated description",
        price: 14.99,
      },
    },
  },
});

// DELETE endpoint for removing a menu item
const menuItemDeleteEndpoint = createEndpoint({
  description: "Delete a specific menu item",
  method: Methods.DELETE,
  requestSchema: z.object({}),
  responseSchema: z.object({ success: z.boolean() }),
  requestUrlSchema: menuItemUrlParamsSchema,
  path: ["v1", "menu", "{itemId}"],
  apiQueryOptions: {
    queryKey: ["delete-menu-item", "{itemId}"],
  },
  fieldDescriptions: {
    itemId: "ID of the menu item to delete",
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    401: "Not authenticated",
    403: "Not authorized to delete this menu item",
    404: "Menu item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {},
    },
    urlPathVariables: {
      default: {
        itemId: "menu-item-id-1",
      },
    },
    responses: {
      default: {
        success: true,
      },
    },
  },
});

/**
 * Menu Item Detail API endpoints
 */
const menuItemDetailEndpoints = {
  ...menuItemGetEndpoint,
  ...menuItemUpdateEndpoint,
  ...menuItemDeleteEndpoint,
};

export default menuItemDetailEndpoints;
