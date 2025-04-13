import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { z } from "zod";

/**
 * Menu API endpoint definitions
 * Provides menu management functionality
 */

// Schema definitions
export const menuItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  price: z.number().positive({ message: "Price must be positive" }),
  category: z.string().min(1, { message: "Category is required" }),
  image: z.string().optional(),
  restaurantId: z.string().uuid(),
});

export type MenuItemType = z.infer<typeof menuItemSchema>;

export const menuItemsResponseSchema = z.array(menuItemSchema);
export type MenuItemsResponseType = z.infer<typeof menuItemsResponseSchema>;

export const menuItemResponseSchema = menuItemSchema;
export type MenuItemResponseType = z.infer<typeof menuItemResponseSchema>;

export const menuItemRequestUrlParamsSchema = z.object({
  restaurantId: z.string().uuid(),
});
export type MenuItemRequestUrlParamsType = z.infer<
  typeof menuItemRequestUrlParamsSchema
>;

// Example data
const exampleMenuItem = {
  id: "menu-item-id-1",
  name: "Margherita Pizza",
  description: "Classic pizza with tomato sauce, mozzarella, and basil",
  price: 12.99,
  category: "Pizza",
  image: "/menu-placeholder.jpg",
  restaurantId: "restaurant-id-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// GET endpoint for retrieving menu items
const menuGetEndpoint = createEndpoint({
  description: "Get all menu items for a restaurant",
  method: Methods.GET,
  requestSchema: undefinedSchema,
  responseSchema: menuItemsResponseSchema,
  requestUrlSchema: menuItemRequestUrlParamsSchema,
  path: ["v1", "menu"],
  apiQueryOptions: {
    queryKey: ["menu-items"],
  },
  fieldDescriptions: {
    restaurantId: "ID of the restaurant to get menu items for",
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
    404: "Restaurant not found",
    500: "Internal server error",
  },
  examples: {
    payloads: undefined,
    urlPathVariables: {
      default: {
        restaurantId: "restaurant-id-1",
      },
    },
    responses: {
      default: [exampleMenuItem],
    },
  },
});

// POST endpoint for creating menu items
const menuCreateEndpoint = createEndpoint({
  description: "Create a new menu item",
  method: Methods.POST,
  requestSchema: menuItemSchema.omit({ id: true }),
  responseSchema: menuItemResponseSchema,
  requestUrlSchema: menuItemRequestUrlParamsSchema,
  path: ["v1", "menu"],
  apiQueryOptions: {
    queryKey: ["create-menu-item"],
  },
  fieldDescriptions: {
    name: "Name of the menu item",
    description: "Description of the menu item",
    price: "Price of the menu item",
    category: "Category of the menu item",
    image: "Image URL for the menu item",
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
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 12.99,
        category: "Pizza",
        image: "/menu-placeholder.jpg",
        restaurantId: "restaurant-id-1",
      },
    },
    urlPathVariables: {
      default: {
        restaurantId: "restaurant-id-1",
      },
    },
    responses: {
      default: exampleMenuItem,
    },
  },
});

/**
 * Menu API endpoints
 */
const menuEndpoints = {
  ...menuGetEndpoint,
  ...menuCreateEndpoint,
};

export default menuEndpoints;
