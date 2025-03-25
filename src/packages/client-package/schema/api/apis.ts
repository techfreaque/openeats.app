import { type ApiSection, typedEndpoint } from "@/next-portal/api/endpoint";

import { orderCreateSchema } from "../schemas";
import { logoutEndpoint } from "./v1/auth/logout";
import { meEndpoint } from "./v1/auth/me";
import { loginEndpoint } from "./v1/auth/public/login";
import { registerEndpoint } from "./v1/auth/public/register";
import { resetPasswordEndpoint } from "./v1/auth/public/reset-password";
import { resetPasswordConfirmEndpoint } from "./v1/auth/public/reset-password-confirm";
import {
  restaurantCreateEndpoint,
  restaurantGetEndpoint,
} from "./v1/restaurant/restaurant";
import { restaurantsEndpoint } from "./v1/restaurant/restaurants";

export {
  loginEndpoint,
  logoutEndpoint,
  meEndpoint,
  registerEndpoint,
  resetPasswordConfirmEndpoint,
  resetPasswordEndpoint,
};

export const endpoints: ApiSection = {
  auth: {
    public: {
      "login": {
        POST: loginEndpoint,
      },
      "register": {
        POST: registerEndpoint,
      },
      "reset-password": {
        POST: resetPasswordEndpoint,
      },
      "reset-password-confirm": {
        POST: resetPasswordConfirmEndpoint,
      },
    },
    me: {
      GET: meEndpoint,
    },
    logout: {
      GET: logoutEndpoint,
    },
  },
  restaurants: {
    GET: restaurantsEndpoint,
  },

  restaurant: {
    GET: restaurantGetEndpoint,
    POST: restaurantCreateEndpoint,
  },

  // Orders endpoints
  orders: {
    GET: typedEndpoint({
      description: "Get all orders for the authenticated user",
      responseSchema: orderCreateSchema,
      requiresAuth: true,
      errorCodes: {
        401: "Not authenticated",
        500: "Internal server error",
      },
      path: ["v1", "orders"],
      method: "GET",
      requestSchema: undefined,
      examples: undefined,
      fieldDescriptions: undefined,
    }),
    POST: typedEndpoint({
      description: "Create a new order",
      requestSchema: orderCreateSchema,
      responseSchema: orderCreateSchema,
      fieldDescriptions: {
        restaurantId: "ID of the restaurant",
        items: "Array of order items (menuItemId and quantity)",
        address: "Delivery address",
      },
      requiresAuth: true,
      errorCodes: {
        400: "Invalid request data",
        401: "Not authenticated",
        404: "Restaurant or menu item not found",
        500: "Internal server error",
      },
      path: ["v1", "orders"],
      method: "POST",
      examples: undefined,
    }),
  },
} as const;
