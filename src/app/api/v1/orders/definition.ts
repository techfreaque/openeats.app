import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import type { ExamplesList } from "next-vibe/shared/types/endpoint";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { createEndpoint } from "@/packages/next-vibe/client/endpoint";

import { userExamples } from "../auth/public/register/definition";
import { DeliveryStatus } from "../order/delivery.schema";
import {
  ordersResponseSchema,
  OrderStatus,
  PaymentMethod,
} from "../order/schema";
import { restaurantExamples } from "../restaurant/definition";
import type { OrdersGetRequestType } from "./schema";
import { ordersGetRequestSchema } from "./schema";

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

const getOrdersEndpoint = createEndpoint({
  description: "Get all orders for the authenticated user",
  responseSchema: ordersResponseSchema,
  errorCodes: {
    401: "Not authenticated",
    500: "Internal server error",
  },
  path: ["v1", "orders"],
  method: Methods.GET,
  requestSchema: ordersGetRequestSchema,
  examples: {
    payloads: getOrdersExamples,
    urlPathVariables: undefined,
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
    UserRoleValue.CUSTOMER,
  ],
  requestUrlSchema: undefinedSchema,
  apiQueryOptions: {
    queryKey: ["orders"],
  },
});

const ordersEndpoints = {
  ...getOrdersEndpoint,
};

export default ordersEndpoints;
