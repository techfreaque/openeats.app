import { z } from "zod";

export const languageResponseSchema = z.object({
  name: z.string().min(2, { message: "Language name is required" }),
  code: z.string().min(2, { message: "Language code is required" }),
});
export const languageCreateSchema = languageResponseSchema.extend({
  countryIds: z.array(
    z.string().uuid({ message: "Valid country ID is required" }),
  ),
});

export const languageUpdateSchema = languageCreateSchema;

export const minimalCountryResponseSchema = z.object({
  code: z.string().min(2, { message: "Country code is required" }),
});
export const countryCreateSchema = minimalCountryResponseSchema.extend({
  name: z.string().min(1, { message: "Country name is required" }),
});

export const countryUpdateSchema = countryCreateSchema;

export const countryResponseSchema = countryCreateSchema.extend({
  languages: z.array(languageResponseSchema),
});
