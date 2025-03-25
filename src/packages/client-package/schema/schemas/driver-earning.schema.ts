import { z } from "zod";

import { dateSchema } from "../../../../packages/next-portal/src/types/common.schema";

const earningBaseSchema = z.object({
  date: dateSchema,
  amount: z.number().positive({ message: "Amount must be positive" }),
  deliveries: z
    .number()
    .int()
    .positive({ message: "Deliveries count must be positive" }),
});

export const earningCreateSchema = earningBaseSchema.extend({
  userId: z.string().uuid({ message: "Valid driver ID is required" }),
});

/**
 * Schema for updating an existing earning record
 */
export const earningUpdateSchema = earningBaseSchema.extend({
  id: z.string().uuid(),
});

/**
 * Schema for earning responses
 */
export const earningResponseSchema = earningUpdateSchema.extend({
  createdAt: dateSchema,
});

/**
 * Schema for earning search parameters
 */
export const earningSearchSchema = z.object({
  driverId: z.string().uuid().nullable(),
  startDate: dateSchema.nullable(),
  endDate: dateSchema.nullable(),
  minAmount: z.number().nullable(),
  maxAmount: z.number().nullable(),
});

/**
 * Schema for earnings summary response
 */
export const earningsSummarySchema = z.object({
  totalEarnings: z.number(),
  totalDeliveries: z.number(),
  averagePerDelivery: z.number(),
  periodStart: dateSchema,
  periodEnd: dateSchema,
});
