import { z } from "zod";

import { restaurantProfileMinimalSchema } from "@/app/api/v1/restaurant/schema/restaurant.schema";
import { dateSchema } from "@/packages/next-vibe/shared/types/common.schema";

import { userPublicDetailedResponseSchema } from "../auth/me/schema";
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

const orderBaseSchema = z.object({
  message: z.string().nullable(),
  customerId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  driverTip: z.number().nonnegative().nullable(),
  restaurantTip: z.number().nonnegative().nullable(),
  projectTip: z.number().nonnegative().nullable(),
});

export const orderCreateSchema = orderBaseSchema.extend({
  restaurantId: z.string().uuid(),
  delivery: deliveryCreateSchema,
  orderItems: z.array(orderItemSchema).min(1),
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

export const orderResponseSchema = orderBaseSchema.extend({
  id: z.string().uuid(),
  status: orderStatusSchema,
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

export const ordersResponseSchema = z.array(orderResponseSchema);
export type OrdersResponseType = z.input<typeof ordersResponseSchema>;

const ordersSelectBase = {
  tax: true,
  total: true,
  projectTip: true,
  paymentMethod: true,
  restaurantTip: true,
  driverTip: true,
  deliveryFee: true,
  delivery: {
    select: {
      id: true,
      zip: true,
      city: true,
      countryId: true,
      distance: true,
      latitude: true,
      longitude: true,
      street: true,
      type: true,
      updatedAt: true,
      phone: true,
      estimatedDeliveryTime: true,
      streetNumber: true,
      status: true,
      createdAt: true,
      estimatedPreparationTime: true,
      message: true,
      driver: {
        select: {
          id: true,
          vehicle: true,
          rating: true,
          ratingCount: true,
          phone: true,
          imageUrl: true,
          licensePlate: true,
        },
      },
    },
  },
};
