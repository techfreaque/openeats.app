import { z } from "zod";

import { dateSchema } from "../../../../packages/next-portal/src/types/common.schema";
import {
  userPublicResponseSchema,
  userResponseMinimalSchema,
} from "../api/v1/auth/user.schema";
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

export const driverUpdateSchema = driverCreateSchema.extend({
  vehicle: z.string(),
  licensePlate: z.string(),
});

export const driverStatusUpdateSchema = z.object({
  driverId: z.string().uuid(),
  isActive: z.boolean().nullable(),
});

export const driverPrivateResponseSchema = driverBaseSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean(),
  rating: z.number(),
  createdAt: dateSchema,
  user: userResponseMinimalSchema,
  earnings: z.array(earningResponseSchema),
});

export const driverPublicResponseSchema = z.object({
  id: z.string().uuid(),
  vehicle: z.string(),
  licensePlate: z.string(),
  // rating: z.number(),
  createdAt: dateSchema,
  user: userPublicResponseSchema,
});
