import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { restaurantExamples } from "../restaurant/definition";
import { DeliveryStatus, DeliveryType } from "./delivery.schema";
import {
  orderCreateSchema,
  orderResponseSchema,
  OrderStatus,
  PaymentMethod,
} from "./schema";

/**
 * Order API endpoint definitions
 * Provides order creation functionality
 */

/**
 * POST endpoint for creating a new order
 */
const createOrderEndpoint = createEndpoint({
  description: "Create a new order",
  requestSchema: orderCreateSchema,
  responseSchema: orderResponseSchema,
  fieldDescriptions: {
    restaurantId: "ID of the restaurant",
    customerId: "ID of the customer",
    delivery: "Delivery details",
    message: "Order message",
    paymentMethod: "Payment method (CARD, CASH, ONLINE)",
    driverTip: "Driver tip",
    restaurantTip: "Restaurant tip",
    projectTip: "Project tip",
    orderItems: "Array of order items (menuItemId and quantity)",
  },
  path: ["v1", "order"],
  method: Methods.POST,
  allowedRoles: [UserRoleValue.PUBLIC, UserRoleValue.CUSTOMER],
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["order-create"],
    disableLocalCache: true,
  },
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    404: "Restaurant or menu item not found",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      default: {
        restaurantId: restaurantExamples.default.id,
        orderItems: [
          {
            menuItemId: "menu-item-id-1",
            quantity: 2,
            message: "without cheese",
          },
        ],
        customerId: "user-id-1",
        paymentMethod: PaymentMethod.CARD,
        delivery: {
          street: "789 Beef St",
          streetNumber: "34",
          city: "Foodville",
          zip: "54322",
          countryId: "AT",
          latitude: 40.713,
          longitude: -74.007,
          distance: 3.5,
          estimatedDeliveryTime: 25,
          estimatedPreparationTime: 20,
          message: "ring the doorbell",
          phone: "+1234567890",
          status: DeliveryStatus.ASSIGNED,
          type: DeliveryType.DELIVERY,
          driverId: "driver-id-1",
        },
        message: "extra ketchup",
        driverTip: 1,
        restaurantTip: 1,
        projectTip: 1,
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        id: "order-id-1",
        status: OrderStatus.NEW,
        total: 29.99,
        deliveryFee: 2.99,
        driverTip: 1,
        restaurantTip: 1,
        projectTip: 1,
        paymentMethod: PaymentMethod.CARD,
        message: "extra ketchup",
        customerId: "user-id-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        restaurant: {
          id: restaurantExamples.default.id,
          name: "Pizza Palace",
          image: "/restaurant-logo.jpg",
        },
        customer: {
          firstName: "John",
          lastName: "Doe",
        },
        delivery: {
          id: "delivery-id-1",
          type: DeliveryType.DELIVERY,
          status: DeliveryStatus.ASSIGNED,
          message: "ring the doorbell",
          estimatedDeliveryTime: 25,
          estimatedPreparationTime: 20,
          distance: 3.5,
          street: "789 Beef St",
          streetNumber: "34",
          zip: "54322",
          city: "Foodville",
          phone: "+1234567890",
          latitude: 40.713,
          longitude: -74.007,
          countryId: "AT",
          updatedAt: new Date().toISOString(),
          orderId: "order-id-1",
          driver: {
            id: "driver-id-1",
            vehicle: "Car",
            licensePlate: "ABC123",
            createdAt: new Date().toISOString(),
            user: {
              firstName: "Mike",
            },
          },
        },
        orderItems: [
          {
            id: "order-item-id-1",
            menuItemId: "menu-item-id-1",
            message: "without cheese",
            quantity: 2,
            price: 12.99,
            taxPercent: 19,
          },
        ],
      },
    },
  },
});
export default createOrderEndpoint;
