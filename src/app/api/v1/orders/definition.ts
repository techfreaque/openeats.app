import { createEndpoint } from "@/packages/next-vibe/client/endpoint";

const ordersEndpoint = createEndpoint({
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
});

const createOrderEndpoint = createEndpoint({
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
});
