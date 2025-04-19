import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { z } from "zod";

import { Currencies } from "@/translations";

import {
  menuItemCreateSchema,
  menuItemResponseSchema,
  menuItemSearchSchema,
} from "../restaurant/schema/menu.schema";

/**
 * Menu Items API endpoint definitions
 * Provides menu items management functionality
 */

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

// GET endpoint for retrieving all menu items
const menuItemsGetEndpoint = createEndpoint({
  description: "Get all menu items",
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: z.array(menuItemResponseSchema),
  requestUrlSchema: undefinedSchema,
  path: ["v1", "menu-items"],
  apiQueryOptions: {
    queryKey: ["menu-items"],
  },
  fieldDescriptions: undefined,
  allowedRoles: [
    UserRoleValue.PUBLIC,
    UserRoleValue.ADMIN,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: undefined,
    responses: {
      default: [exampleMenuItem],
    },
  },
});

// POST endpoint for creating a menu item
const menuItemCreateEndpoint = createEndpoint({
  description: "Create a new menu item",
  method: Methods.POST,
  requestSchema: menuItemCreateSchema,
  responseSchema: menuItemResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "menu-items"],
  apiQueryOptions: {
    queryKey: ["create-menu-item"],
  },
  fieldDescriptions: {
    createdAt: "Creation date",
    updatedAt: "Last update date",
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
    403: "Not authorized to modify this restaurant's menu",
    404: "Restaurant not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
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
        categoryId: "category-id-1",
        restaurantId: "restaurant-id-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: exampleMenuItem,
    },
  },
});

// Search endpoint for menu items
const menuItemSearchEndpoint = createEndpoint({
  description: "Search menu items",
  method: Methods.POST,
  requestSchema: menuItemSearchSchema,
  responseSchema: z.array(menuItemResponseSchema),
  requestUrlSchema: undefinedSchema,
  path: ["v1", "menu-items", "search"],
  apiQueryOptions: {
    queryKey: ["search-menu-items"],
  },
  fieldDescriptions: {
    categoryId: "Filter by category ID",
    published: "Filter by published status",
    minPrice: "Filter by minimum price",
    maxPrice: "Filter by maximum price",
    restaurantId: "Filter by restaurant ID",
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
    400: "Invalid request data",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        categoryId: "category-id-1",
        published: true,
        minPrice: 5,
        maxPrice: 20,
        restaurantId: "restaurant-id-1",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: [exampleMenuItem],
    },
  },
});

// PUT endpoint for updating a menu item
const menuItemUpdateEndpoint = createEndpoint({
  description: "Update a menu item",
  method: Methods.PUT,
  requestSchema: menuItemCreateSchema.extend({
    id: z.string().uuid(),
  }),
  responseSchema: menuItemResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "menu-items"],
  apiQueryOptions: {
    queryKey: ["update-menu-item"],
  },
  fieldDescriptions: {
    id: "ID of the menu item to update",
    name: "Name of the menu item",
    description: "Description of the menu item",
    price: "Price of the menu item",
    taxPercent: "Tax percentage for the menu item",
    currency: "Currency for the menu item",
    image: "Image URL for the menu item",
    published: "Whether the menu item is published",
    isAvailable: "Whether the menu item is available",
    restaurantId: "ID of the restaurant this menu item belongs to",
    categoryId: "ID of the category this menu item belongs to",
    createdAt: "Creation date",
    updatedAt: "Last update date",
    availableFrom: "Date from which the menu item is available",
    availableTo: "Date until which the menu item is available",
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized to modify this restaurant's menu",
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
        restaurantId: "restaurant-id-1",
        availableFrom: null,
        availableTo: null,
        categoryId: "category-id-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: exampleMenuItem,
    },
  },
});

// DELETE endpoint for deleting a menu item
const menuItemDeleteEndpoint = createEndpoint({
  description: "Delete a menu item",
  method: Methods.DELETE,
  requestSchema: z.object({
    id: z.string().uuid(),
  }),
  responseSchema: z.object({
    deleted: z.boolean(),
  }),
  requestUrlSchema: undefinedSchema,
  path: ["v1", "menu-items"],
  apiQueryOptions: {
    queryKey: ["delete-menu-item"],
  },
  fieldDescriptions: {
    id: "ID of the menu item to delete",
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized to delete this menu item",
    404: "Menu item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        id: "menu-item-id-1",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        deleted: true,
      },
    },
  },
});

/**
 * Menu Items API endpoints
 */
const menuItemsEndpoints = {
  ...menuItemsGetEndpoint,
  ...menuItemCreateEndpoint,
  ...menuItemUpdateEndpoint,
  ...menuItemDeleteEndpoint,
  ...menuItemSearchEndpoint,
};

export default menuItemsEndpoints;
