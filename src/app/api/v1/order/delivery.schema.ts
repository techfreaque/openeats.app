import { z } from "zod";

import { dateSchema } from "@/packages/next-vibe/shared/types/common.schema";

import { driverPublicResponseSchema } from "../../../../packages/client/schema/schemas/driver.schema";

export enum DeliveryType {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY",
  DINE_IN = "DINE_IN",
  ALL = "ALL",
}

export enum DeliveryStatus {
  ASSIGNED = "ASSIGNED",
  PICKED_UP = "PICKED_UP",
  DELIVERED = "DELIVERED",
}
const deliveryTypeSchema = z.nativeEnum(DeliveryType);

const deliveryStatusSchema = z.nativeEnum(DeliveryStatus);

const deliveryBaseSchema = z.object({
  type: deliveryTypeSchema,
  status: deliveryStatusSchema,
  message: z.string().nullable(),
  estimatedDeliveryTime: z.number().int().nullable(), // in minutes
  estimatedPreparationTime: z.number().int(), // in minutes
  distance: z.number().positive().nullable(), // in kilometers
  street: z.string().nullable(),
  streetNumber: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  phone: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  countryId: z.string().nullable(),
});

export const deliveryCreateSchema = deliveryBaseSchema.extend({
  driverId: z.string().uuid().nullable(),
});
export type DeliveryCreateType = z.infer<typeof deliveryCreateSchema>;

export const deliveryUpdateSchema = z.object({
  id: z.string().uuid(),
  status: deliveryStatusSchema,
  estimatedDelivery: dateSchema.nullable(),
  deliveredAt: dateSchema.nullable(),
  estimatedTime: z.number().int(),
  orderId: z.string().uuid(),
  driverId: z.string().uuid().nullable(),
});
export type DeliveryUpdateType = z.infer<typeof deliveryUpdateSchema>;

export const deliveryResponseSchema = deliveryBaseSchema.extend({
  id: z.string().uuid(),
  updatedAt: dateSchema,
  driver: driverPublicResponseSchema.nullable(),
  orderId: z.string().uuid(),
});
export type DeliveryResponseType = z.input<typeof deliveryResponseSchema>;
