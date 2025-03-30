import { z } from "zod";

import {
  userPublicResponseSchema,
  userResponseMinimalSchema,
} from "@/app/api/v1/auth/me/schema/user.schema";
import { dateSchema } from "@/packages/next-vibe/shared/types/common.schema";

import { earningResponseSchema } from "./driver-earning.schema";

const driverBaseSchema = z.object({
  vehicle: z.string(),
  licensePlate: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  zip: z.string(),
  city: z.string(),
  countryId: z.string(),
  radius: z.number(),
});

export const driverCreateSchema = driverBaseSchema.extend({
  userId: z.string().uuid(),
});
export type DriverCreateType = z.infer<typeof driverCreateSchema>;

export const driverUpdateSchema = driverCreateSchema.extend({
  vehicle: z.string(),
  licensePlate: z.string(),
});

export const driverStatusUpdateSchema = z.object({
  driverId: z.string().uuid(),
  isActive: z.boolean().nullable(),
});
export type DriverUpdateType = z.infer<typeof driverUpdateSchema>;

export const driverPrivateResponseSchema = driverBaseSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean(),
  rating: z.number(),
  createdAt: dateSchema,
  user: userResponseMinimalSchema,
  earnings: z.array(earningResponseSchema),
});
export type DriverPrivateResponseType = z.input<
  typeof driverPrivateResponseSchema
>;

export const driverPublicResponseSchema = z.object({
  id: z.string().uuid(),
  vehicle: z.string(),
  licensePlate: z.string(),
  // rating: z.number(),
  createdAt: dateSchema,
  user: userPublicResponseSchema,
});
export type DriverPublicResponseType = z.input<
  typeof driverPublicResponseSchema
>;
