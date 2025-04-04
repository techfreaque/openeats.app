import * as paypal from "@paypal/checkout-server-sdk";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { envClient } from "@/config/env-client";

interface PaymentRequestBody {
  provider: "nowpayments" | "paypal";
  action: "create" | "capture";
  amount: number;
  currency: string;
  orderId?: string; // for nowpayments
  orderID?: string; // for PayPal capture
}

interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  orderID?: string;
  details?: unknown;
  message?: string;
}

function paypalEnvironment(): paypal.core.Environment {
  // Use SandboxEnvironment for testing; switch to LiveEnvironment in production.
  return new paypal.core.SandboxEnvironment(
    envClient.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    env.PAYPAL_CLIENT_SECRET,
  );
}

function paypalClient(): paypal.core.PayPalHttpClient {
  return new paypal.core.PayPalHttpClient(paypalEnvironment());
}

async function processNowPayments(
  data: PaymentRequestBody,
): Promise<PaymentResponse> {
  const payload = {
    price_amount: data.amount,
    price_currency: data.currency,
    pay_currency: "BTC", // adjust as needed
    order_id: data.orderId || `NP_${Date.now()}`,
    order_description: "NowPayments crypto payment",
    success_url: `${envClient.NEXT_PUBLIC_FRONTEND_APP_URL}/payment/success`,
    cancel_url: `${envClient.NEXT_PUBLIC_FRONTEND_APP_URL}/payment/cancel`,
  };

  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": env.NOWPAYMENTS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("NowPayments invoice creation failed");
  }
  const result = await res.json();
  return { success: true, payment_url: result.invoice_url };
}

async function processPayPalCreate(
  data: PaymentRequestBody,
): Promise<PaymentResponse> {
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
  const orderID = order.result.id;
  return { success: true, orderID };
}

async function processPayPalCapture(
  data: PaymentRequestBody,
): Promise<PaymentResponse> {
  if (!data.orderID) {
    throw new Error("Missing orderID for capture");
  }
  const request = new paypal.orders.OrdersCaptureRequest(data.orderID);
  request.requestBody({});
  const client = paypalClient();
  const captureResponse = await client.execute(request);
  return { success: true, details: captureResponse.result };
}

export async function POST(request: NextRequest) {
  try {
    const data: PaymentRequestBody = await request.json();
    let response: PaymentResponse;

    if (data.provider === "nowpayments") {
      response = await processNowPayments(data);
    } else if (data.provider === "paypal") {
      if (data.action === "create") {
        response = await processPayPalCreate(data);
      } else if (data.action === "capture") {
        response = await processPayPalCapture(data);
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Unsupported provider" },
        { status: 400 },
      );
    }
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
