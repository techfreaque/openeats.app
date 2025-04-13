import "server-only";

import * as paypal from "@paypal/checkout-server-sdk";
import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { env } from "@/config/env";
import { envClient } from "@/config/env-client";

import type { PaymentRequestType, PaymentResponseType } from "./schema";

/**
 * Payment API route handlers
 * Provides payment processing functionality
 */

/**
 * Create PayPal client
 * @returns PayPal client
 */
function paypalClient(): paypal.core.PayPalHttpClient {
  const environment =
    env.NODE_ENV === "production"
      ? new paypal.core.LiveEnvironment(
          envClient.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
          env.PAYPAL_CLIENT_SECRET || "",
        )
      : new paypal.core.SandboxEnvironment(
          envClient.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
          env.PAYPAL_CLIENT_SECRET || "",
        );

  return new paypal.core.PayPalHttpClient(environment);
}

/**
 * Process a payment
 * @param props - API handler props
 * @returns Payment response
 */
export const processPayment: ApiHandlerFunction<
  PaymentRequestType,
  PaymentResponseType,
  UndefinedType
> = async ({ data, user }) => {
  try {
    debugLogger("Processing payment", {
      userId: user.id,
      provider: data.provider,
      action: data.action,
      amount: data.amount,
    });

    // Process payment based on provider and action
    if (data.provider === "nowpayments") {
      return await processNowPayments(data);
    } else if (data.provider === "paypal") {
      if (data.action === "create") {
        return await processPayPalCreate(data);
      } else if (data.action === "capture") {
        return await processPayPalCapture(data);
      } else {
        debugLogger("Invalid PayPal action", { action: data.action });
        return {
          success: false,
          message: "Invalid action for PayPal",
          errorCode: 400,
        };
      }
    } else {
      debugLogger("Unsupported payment provider", { provider: data.provider });
      return {
        success: false,
        message: "Unsupported provider",
        errorCode: 400,
      };
    }
  } catch (error) {
    debugLogger("Error processing payment", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error processing payment",
      errorCode: 500,
    };
  }
};

/**
 * Process NowPayments payment
 * @param data - Payment request data
 * @returns Payment response
 */
async function processNowPayments(
  data: PaymentRequestType,
): Promise<{ success: true; data: PaymentResponseType }> {
  const payload = {
    price_amount: data.amount,
    price_currency: data.currency,
    pay_currency: "BTC", // adjust as needed
    order_id: data.orderId ?? `NP_${Date.now()}`,
    order_description: "NowPayments crypto payment",
    success_url: `${envClient.NEXT_PUBLIC_FRONTEND_APP_URL}/payment/success`,
    cancel_url: `${envClient.NEXT_PUBLIC_FRONTEND_APP_URL}/payment/cancel`,
  };

  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": env.NOWPAYMENTS_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("NowPayments invoice creation failed");
  }

  const result = (await res.json()) as { invoice_url: string };

  return {
    success: true,
    data: {
      success: true,
      payment_url: result.invoice_url,
    },
  };
}

/**
 * Process PayPal create payment
 * @param data - Payment request data
 * @returns Payment response
 */
async function processPayPalCreate(
  data: PaymentRequestType,
): Promise<{ success: true; data: PaymentResponseType }> {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: data.currency,
          value: data.amount.toFixed(2),
        },
      },
    ],
  });

  const client = paypalClient();
  const order = await client.execute(request);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const orderID = order.result.id as string;

  return {
    success: true,
    data: {
      success: true,
      orderID,
    },
  };
}

/**
 * Process PayPal capture payment
 * @param data - Payment request data
 * @returns Payment response
 */
async function processPayPalCapture(
  data: PaymentRequestType,
): Promise<{ success: true; data: PaymentResponseType }> {
  if (!data.orderID) {
    throw new Error("Missing orderID for capture");
  }

  const request = new paypal.orders.OrdersCaptureRequest(data.orderID);

  // @ts-ignore - PayPal SDK types are incomplete
  request.requestBody({});

  const client = paypalClient();
  const captureResponse = await client.execute(request);

  return {
    success: true,
    data: {
      success: true,
      details: captureResponse.result,
    },
  };
}
