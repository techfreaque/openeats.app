import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

import { DeliveryStatus } from "../order/delivery.schema";
import {
  ordersResponseSchema,
  OrderStatus,
  PaymentMethod,
} from "../order/schema";

export const ordersGetRequestSchema = z.object({
  restaurantId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  orderStatus: z.nativeEnum(OrderStatus).optional(),
  deliveryStatus: z.nativeEnum(DeliveryStatus).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(100),
});
export type OrdersGetRequestType = z.infer<typeof ordersGetRequestSchema>;

export const ordersGetResponseSchema = z.array(ordersResponseSchema);
export type OrdersGetResponseInputType = z.input<
  typeof ordersGetResponseSchema
>;
export type OrdersGetResponseOutputType = z.input<
  typeof ordersGetResponseSchema
>;
