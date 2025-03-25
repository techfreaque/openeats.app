import { z } from "zod";

import { dateSchema } from "../../../../packages/next-portal/src/types/common.schema";
import { userPublicDetailedResponseSchema } from "../api/v1/auth/user.schema";
import { restaurantProfileMinimalSchema } from "../api/v1/restaurant/restaurant.schema";
import {
  deliveryCreateSchema,
  deliveryResponseSchema,
} from "./delivery.schema";

const orderStatusSchema = z.enum([
  "NEW",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  message: z.string().nullable(),
});

export const orderCreateSchema = z.object({
  restaurantId: z.string().uuid(),
  customerId: z.string().uuid(),
  message: z.string().nullable(),
  orderItems: z.array(orderItemSchema).min(1),
  deliveryFee: z.number().nonnegative(),
  driverTip: z.number().nonnegative().nullable(),
  delivery: deliveryCreateSchema,
  restaurantTip: z.number().nonnegative().nullable(),
  projectTip: z.number().nonnegative().nullable(),
});

export const orderUpdateSchema = z.object({
  status: orderStatusSchema,
  message: z.string().nullable(),
});

export const orderItemResponseSchema = z.object({
  id: z.string().uuid(),
  menuItemId: z.string().uuid(),
  message: z.string().nullable(),
  quantity: z.number().int(),
  price: z.number(),
  taxPercent: z.number(),
});

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  message: z.string().nullable(),
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
