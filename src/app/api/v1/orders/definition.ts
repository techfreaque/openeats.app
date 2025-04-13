import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { userExamples } from "../auth/public/register/definition";
import { DeliveryStatus, DeliveryType } from "../order/delivery.schema";
import {
  ordersResponseSchema,
  OrderStatus,
  PaymentMethod,
} from "../order/schema";
import { restaurantExamples } from "../restaurant/definition";
import type { OrdersGetRequestType } from "./schema";
import { ordersGetRequestSchema } from "./schema";

/**
 * Orders API endpoint definitions
 * Provides order listing functionality
 */

const getOrdersExamples: ExamplesList<OrdersGetRequestType, "default"> = {
  default: {
    restaurantId: restaurantExamples.default.id,
    customerId: userExamples.customer.id,
    paymentMethod: PaymentMethod.CARD,
    orderStatus: OrderStatus.NEW,
    deliveryStatus: DeliveryStatus.ASSIGNED,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    page: 1,
    limit: 100,
  },
};

/**
 * GET endpoint for retrieving orders
 */
const getOrdersEndpoint = createEndpoint({
  description: "Get all orders for the authenticated user",
  responseSchema: ordersResponseSchema,
  requestSchema: ordersGetRequestSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "orders"],
  method: Methods.GET,
  apiQueryOptions: {
    queryKey: ["orders"],
  },
  fieldDescriptions: {
    restaurantId: "Filter by restaurant ID",
    customerId: "Filter by customer ID",
    paymentMethod: "Filter by payment method",
    orderStatus: "Filter by order status",
    deliveryStatus: "Filter by delivery status",
    startDate: "Start date for filtering orders",
    endDate: "End date for filtering orders",
    page: "Page number for pagination",
    limit: "Number of orders per page",
  },
  allowedRoles: [
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
    UserRoleValue.CUSTOMER,
    UserRoleValue.COURIER,
  ],
  errorCodes: {
    401: "Not authenticated",
    500: "Internal server error",
  },
  examples: {
    payloads: getOrdersExamples,
    urlPathVariables: undefined,
    responses: {
      default: [
        {
          id: "order-id-1",
          status: OrderStatus.NEW,
          total: 29.99,
          deliveryFee: 2.99,
          driverTip: 1,
          restaurantTip: 1,
          projectTip: 1,
          paymentMethod: PaymentMethod.CARD,
          message: "extra ketchup",
          customerId: userExamples.customer.id ?? "customer-id-1",
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
            city: "New York",
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
                firstName: "John",
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
      ],
    },
  },
});

/**
 * Orders API endpoints
 */
const ordersEndpoints = {
  ...getOrdersEndpoint,
};

export default ordersEndpoints;
