import { z } from "zod";

/**
 * Payment API schemas
 * Provides payment processing functionality
 */

/**
 * Payment provider enum
 */
export const PaymentProviderEnum = z.enum(["nowpayments", "paypal"]);
export type PaymentProviderType = z.infer<typeof PaymentProviderEnum>;

/**
 * Payment action enum
 */
export const PaymentActionEnum = z.enum(["create", "capture"]);
export type PaymentActionType = z.infer<typeof PaymentActionEnum>;

/**
 * Payment request schema
 */
export const paymentRequestSchema = z.object({
  provider: PaymentProviderEnum,
  action: PaymentActionEnum,
  amount: z.number().positive(),
  currency: z.string().min(1),
  orderId: z.string().optional(), // for nowpayments
  orderID: z.string().optional(), // for PayPal capture
});
export type PaymentRequestType = z.infer<typeof paymentRequestSchema>;

/**
 * Payment response schema
 */
export const paymentResponseSchema = z.object({
  success: z.boolean(),
  payment_url: z.string().optional(),
  orderID: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  message: z.string().optional(),
});
export type PaymentResponseType = z.infer<typeof paymentResponseSchema>;
