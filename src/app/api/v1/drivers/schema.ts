import { z } from "zod";

import { Countries } from "@/translations";

/**
 * Driver API schemas
 * Provides driver management functionality
 */

/**
 * Driver response schema
 */
export const driverResponseSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
  vehicle: z.string(),
  licensePlate: z.string(),
  radius: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  phone: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  zip: z.string(),
  city: z.string(),
  countryId: z.enum(["DE", "AT", "CH"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userId: z.string().uuid(),
  rating: z.string(),
  ratingRecent: z.string(),
  ratingCount: z.number(),
  user: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    imageUrl: z.string().nullable().optional(),
  }),
});
export type DriverResponseType = z.infer<typeof driverResponseSchema>;

/**
 * Driver create schema
 */
export const driverCreateSchema = z.object({
  userId: z.string().uuid(),
  vehicle: z.string(),
  licensePlate: z.string(),
  radius: z.number(),
  latitude: z.string(),
  longitude: z.string(),
  phone: z.string(),
  street: z.string(),
  streetNumber: z.string(),
  zip: z.string(),
  city: z.string(),
  countryId: z.nativeEnum(Countries),
  isActive: z.boolean().optional().default(true),
});
export type DriverCreateType = z.infer<typeof driverCreateSchema>;

/**
 * Driver update schema
 */
export const driverUpdateSchema = driverCreateSchema.partial().extend({
  id: z.string().uuid(),
});
export type DriverUpdateType = z.infer<typeof driverUpdateSchema>;

/**
 * Drivers response schema
 */
export const driversResponseSchema = z.array(driverResponseSchema);
export type DriversResponseType = z.infer<typeof driversResponseSchema>;
