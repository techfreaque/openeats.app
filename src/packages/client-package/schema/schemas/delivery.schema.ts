import { z } from "zod";

import { dateSchema } from "../../../../packages/next-portal/src/types/common.schema";
import { driverPublicResponseSchema } from "./driver.schema";

const deliveryTypeSchema = z.enum(["PICKUP", "DELIVERY"]);

const deliveryStatusSchema = z.enum(["ASSIGNED", "PICKED_UP", "DELIVERED"]);

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

export const deliveryUpdateSchema = z.object({
  id: z.string().uuid(),
  status: deliveryStatusSchema,
  estimatedDelivery: dateSchema.nullable(),
  deliveredAt: dateSchema.nullable(),
  estimatedTime: z.number().int(),
  orderId: z.string().uuid(),
  driverId: z.string().uuid().nullable(),
});

export const deliveryResponseSchema = deliveryBaseSchema.extend({
  id: z.string().uuid(),
  updatedAt: dateSchema,
  driver: driverPublicResponseSchema.nullable(),
  orderId: z.string().uuid(),
});
