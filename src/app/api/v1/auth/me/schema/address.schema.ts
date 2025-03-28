import { z } from "zod";

import { minimalCountryResponseSchema } from "../../../../../../packages/client/schema/schemas/locale.schema";

const addressBaseSchema = z.object({
  userId: z.string().uuid({ message: "Valid user ID is required" }),
  label: z.string().min(1, { message: "Label is required" }),
  name: z.string().min(1, { message: "Your name is required" }),
  street: z.string().min(1, { message: "Street is required" }),
  streetNumber: z.string().min(1, { message: "Street number is required" }),
  zip: z.string().min(1, { message: "ZIP code is required" }),
  city: z.string().min(1, { message: "City is required" }),
  phone: z.string().nullable(),
  message: z.string().nullable(),
  isDefault: z.boolean().nullable().default(false),
});

export const addressCreateSchema = addressBaseSchema.extend({
  countryId: z.string().uuid({ message: "Valid country ID is required" }),
});
export type AddressCreateType = z.infer<typeof addressCreateSchema>;

export const addressUpdateSchema = addressCreateSchema;
export type AddressUpdateType = z.infer<typeof addressUpdateSchema>;

export const addressResponseSchema = addressBaseSchema.extend({
  country: minimalCountryResponseSchema,
});
export type AddressResponseType = z.input<typeof addressResponseSchema>;
