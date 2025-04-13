import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { paymentRequestSchema, paymentResponseSchema } from "./schema";

/**
 * Payment API endpoint definitions
 * Provides payment processing functionality
 */

/**
 * POST endpoint for processing payments
 */
const paymentProcessEndpoint = createEndpoint({
  description: "Process a payment",
  method: Methods.POST,
  requestSchema: paymentRequestSchema,
  responseSchema: paymentResponseSchema,
  requestUrlSchema: undefinedSchema,
  path: ["v1", "payment"],
  apiQueryOptions: {
    queryKey: ["payment-process"],
  },
  fieldDescriptions: {
    provider: "Payment provider (nowpayments or paypal)",
    action: "Payment action (create or capture)",
    amount: "Payment amount",
    currency: "Payment currency",
    orderId: "Order ID for nowpayments",
    orderID: "Order ID for PayPal capture",
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    400: "Invalid request data",
    401: "Not authenticated",
    403: "Not authorized",
    500: "Internal server error",
  },
  examples: {
    payloads: {
      paypal_create: {
        provider: "paypal",
        action: "create",
        amount: 25.99,
        currency: "USD",
      },
      paypal_capture: {
        provider: "paypal",
        action: "capture",
        amount: 25.99,
        currency: "USD",
        orderID: "5O190127TN364715T",
      },
      nowpayments: {
        provider: "nowpayments",
        action: "create",
        amount: 25.99,
        currency: "USD",
        orderId: "order-123",
      },
    },
    urlPathVariables: undefined,
    responses: {
      paypal_create: {
        success: true,
        orderID: "5O190127TN364715T",
      },
      paypal_capture: {
        success: true,
        details: {
          id: "5O190127TN364715T",
          status: "COMPLETED",
        },
      },
      nowpayments: {
        success: true,
        payment_url: "https://nowpayments.io/payment/invoice-123",
      },
    },
  },
});

/**
 * Payment API endpoints
 */
const paymentEndpoints = {
  ...paymentProcessEndpoint,
};

export default paymentEndpoints;
