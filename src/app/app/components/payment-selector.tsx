"use client";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { JSX } from "react";
import { useState } from "react";

import { envClient } from "@/config/env-client";

type ProviderType = "nowpayments" | "paypal";

export default function PaymentPage(): JSX.Element {
  const [provider, setProvider] = useState<ProviderType>("nowpayments");
  const [paypalOrderID, setPaypalOrderID] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const initiateNowPayments = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        provider: "nowpayments",
        action: "create",
        amount: 100,
        currency: "EUR",
        orderId: `ORDER_${Date.now()}`,
      };
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setError(data.message || "Payment initiation failed");
      }
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const renderPayPalButtons = (): JSX.Element => (
    <PayPalScriptProvider
      options={{
        clientId: envClient.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: "EUR",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={async () => {
          const payload = {
            provider: "paypal",
            action: "create",
            amount: 100,
            currency: "USD",
          };
          const res = await fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.success && data.orderID) {
            return data.orderID;
          }
          throw new Error(data.message || "PayPal order creation failed");
        }}
        onApprove={async (data, actions) => {
          const payload = {
            provider: "paypal",
            action: "capture",
            orderID: data.orderID,
            amount: 100,
            currency: "USD",
          };
          const res = await fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const result = await res.json();
          if (result.success) {
            setPaypalOrderID(data.orderID);
          } else {
            setError(result.message || "Capture failed");
          }
        }}
        onError={(err) => setError(err.message || "PayPal error")}
      />
    </PayPalScriptProvider>
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Multi-Payment Processing</h1>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          <input
            type="radio"
            name="provider"
            value="nowpayments"
            checked={provider === "nowpayments"}
            onChange={() => setProvider("nowpayments")}
          />{" "}
          NowPayments (Crypto)
        </label>
        <label style={{ marginLeft: "1rem" }}>
          <input
            type="radio"
            name="provider"
            value="paypal"
            checked={provider === "paypal"}
            onChange={() => setProvider("paypal")}
          />{" "}
          PayPal
        </label>
      </div>
      <div style={{ marginTop: "1rem" }}>
        {provider === "nowpayments" && (
          <button
            onClick={initiateNowPayments}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Pay with Crypto"}
          </button>
        )}
        {provider === "paypal" && renderPayPalButtons()}
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {provider === "paypal" && paypalOrderID && (
        <div style={{ marginTop: "1rem" }}>
          <h2>PayPal Order</h2>
          <p>
            Your PayPal Order ID: <strong>{paypalOrderID}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
