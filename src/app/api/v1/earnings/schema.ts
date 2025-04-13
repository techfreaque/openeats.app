import { z } from "zod";

/**
 * Earnings API schemas
 * Provides driver earnings management functionality
 */

/**
 * Earnings response schema
 */
export const earningResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  date: z.string().datetime(),
  amount: z.number().positive(),
  deliveries: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
export type EarningResponseType = z.infer<typeof earningResponseSchema>;

/**
 * Earnings create schema
 */
export const earningCreateSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().datetime(),
  amount: z.number().positive(),
  deliveries: z.number().int().nonnegative(),
});
export type EarningCreateType = z.infer<typeof earningCreateSchema>;

/**
 * Earnings list response schema
 */
export const earningsResponseSchema = z.array(earningResponseSchema);
export type EarningsResponseType = z.infer<typeof earningsResponseSchema>;
