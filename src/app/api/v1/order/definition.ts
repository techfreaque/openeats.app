import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import registerEndpoint from "../auth/public/register/definition";
import { restaurantExamples } from "../restaurant/definition";
import { DeliveryStatus, DeliveryType } from "./delivery.schema";
import { orderCreateSchema, orderResponseSchema } from "./order.schema";

const createOrderEndpoint = createEndpoint({
  description: "Create a new order",
  requestSchema: orderCreateSchema,
  responseSchema: orderResponseSchema,
  fieldDescriptions: {
    restaurantId: "ID of the restaurant",
    customerId: "ID of the customer",
    delivery: "Delivery details",
    message: "Order message",
    deliveryFee: "Delivery fee",
    driverTip: "Driver tip",
    restaurantTip: "Restaurant tip",
    projectTip: "Project tip",
    orderItems: "Array of order items (menuItemId and quantity)",
  },

  requiresAuth: true,
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    404: "Restaurant or menu item not found",
    500: "Internal server error",
  },
  path: ["v1", "orders"],
  method: Methods.POST,
  allowedRoles: [UserRoleValue.PUBLIC, UserRoleValue.CUSTOMER],
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["order-create"],
    disableLocalCache: true,
  },
  examples: {
    payloads: {
      default: {
        id: "03820091-b135-4e0b-877e-8a26b4265444",
        restaurantId: restaurantExamples.default.id,
        orderItems: [
          {
            menuItemId: this.menuItemExamples.default.id,
            quantity: 2,
            message: "without cheese",
          },
        ],
        customerId: registerEndpoint.POST.examples.payloads.default.id!,
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
          driverId: registerEndpoint.POST.examples.payloads.default.id!,
        },

        message: "extra ketchup",
        deliveryFee: 2,
        driverTip: 1,
        restaurantTip: 1,
        projectTip: 1,
      },
      example1: {
        id: "03820091-b135-4e0b-877e-8a26b4265274",
        restaurantId: restaurantExamples["example1"]!.id,
        orderItems: [
          {
            menuItemId: this.menuItemExamples.example1.id,
            quantity: 2,
            message: "without cheese",
          },
        ],
        customerId: registerEndpoint.POST.examples.payloads.customer.id!,
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
          driverId: registerEndpoint.POST.examples.payloads.driver.id!,
        },
        message: "extra ketchup",
        deliveryFee: 2,
        driverTip: 1,
        restaurantTip: 1,
        projectTip: 1,
      },
      example2: {
        id: "8d5fef47-2b8e-4187-9554-527e6a524073",
        restaurantId: restaurantExamples["example2"]!.id,
        orderItems: [
          {
            menuItemId: this.menuItemExamples.example2.id,
            quantity: 2,
            message: "without cheese",
          },
        ],
        customerId: registerEndpoint.POST.examples.payloads.customer.id!,
        delivery: {
          street: null,
          streetNumber: null,
          city: null,
          zip: null,
          countryId: null,
          latitude: null,
          longitude: null,
          distance: null,
          estimatedDeliveryTime: null,
          estimatedPreparationTime: 20,
          message: "Hello",
          phone: "+1234567890",
          status: DeliveryStatus.ASSIGNED,
          type: DeliveryType.PICKUP,
          driverId: null,
        },
        message: "ring the doorbell",
        deliveryFee: 2,
        driverTip: 1,
        restaurantTip: 1,
        projectTip: 1,
      },
    },
  },
});
export default createOrderEndpoint;
