import { z } from "zod";

export const languageResponseSchema = z.object({
  name: z.string().min(2, { message: "Language name is required" }),
  code: z.string().min(2, { message: "Language code is required" }),
});
export type LanguageResponseType = z.input<typeof languageResponseSchema>;

export const languageCreateSchema = languageResponseSchema.extend({
  countryIds: z.array(
    z.string().uuid({ message: "Valid country ID is required" }),
  ),
});
export type LanguageCreateType = z.infer<typeof languageCreateSchema>;

export const languageUpdateSchema = languageCreateSchema;
export type LanguageUpdateType = z.infer<typeof languageUpdateSchema>;

export const minimalCountryResponseSchema = z.object({
  code: z.string().min(2, { message: "Country code is required" }),
});
export type MinimalCountryResponseType = z.input<
  typeof minimalCountryResponseSchema
>;

export const countryCreateSchema = minimalCountryResponseSchema.extend({
  name: z.string().min(1, { message: "Country name is required" }),
});

export const countryUpdateSchema = countryCreateSchema;
export type CountryUpdateType = z.infer<typeof countryUpdateSchema>;

export const countryResponseSchema = countryCreateSchema.extend({
  languages: z.array(languageResponseSchema),
});
export type CountryResponseType = z.input<typeof countryResponseSchema>;
