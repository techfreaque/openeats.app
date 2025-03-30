import { z } from "zod";

import { restaurantProfileMinimalSchema } from "@/app/api/v1/restaurant/schema/restaurant.schema";
import { dateSchema } from "@/packages/next-vibe/shared/types/common.schema";

import { userPublicDetailedResponseSchema } from "../auth/me/schema/user.schema";
import {
  deliveryCreateSchema,
  deliveryResponseSchema,
} from "./delivery.schema";

export enum PaymentMethod {
  CARD = "CARD",
  CASH = "CASH",
  ONLINE = "ONLINE",
}

export enum OrderStatus {
  NEW = "NEW",
  PREPARING = "PREPARING",
  READY = "READY",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

const orderStatusSchema = z.nativeEnum(OrderStatus);

export const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  message: z.string().nullable(),
});
export type OrderItemType = z.infer<typeof orderItemSchema>;

export const orderCreateSchema = z.object({
  restaurantId: z.string().uuid(),
  customerId: z.string().uuid(),
  message: z.string().nullable(),
  orderItems: z.array(orderItemSchema).min(1),
  deliveryFee: z.number().nonnegative(),
  driverTip: z.number().nonnegative().nullable(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  delivery: deliveryCreateSchema,
  restaurantTip: z.number().nonnegative().nullable(),
  projectTip: z.number().nonnegative().nullable(),
});
export type OrderCreateType = z.infer<typeof orderCreateSchema>;

export const orderUpdateSchema = z.object({
  status: orderStatusSchema,
  message: z.string().nullable(),
});
export type OrderUpdateType = z.infer<typeof orderUpdateSchema>;

export const orderItemResponseSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  message: z.string().nullable(),
  quantity: z.number().int(),
  price: z.number(),
  taxPercent: z.number(),
});
export type OrderItemResponseType = z.input<typeof orderItemResponseSchema>;

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string().nullable(),
  status: orderStatusSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
  total: z.number(),
  deliveryFee: z.number(),
  driverTip: z.number().nullable(),
  restaurantTip: z.number().nullable(),
  projectTip: z.number().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  restaurant: restaurantProfileMinimalSchema,
  customer: userPublicDetailedResponseSchema,
  delivery: deliveryResponseSchema,
  orderItems: z.array(orderItemResponseSchema),
});
export type OrderResponseType = z.input<typeof orderResponseSchema>;
