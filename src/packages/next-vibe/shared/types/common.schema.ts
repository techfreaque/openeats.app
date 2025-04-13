import { z } from "zod";

// Common reusable schemas

export const dateSchema = z
  .string()
  .or(z.date())
  .transform((val) => (val instanceof Date ? val.toISOString() : val));
export type DateType = z.input<typeof dateRangeSchema>;

export const idSchema = z.object({
  id: z.string().uuid(),
});
export type IdType = z.infer<typeof idSchema>;

export const stringToIntSchema = (
  errorMessage: string,
): z.ZodEffects<z.ZodString, number, string> =>
  z.string().transform((val: string): number => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      throw new Error(errorMessage);
    }
    return parsed;
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
export type PaginationType = z.infer<typeof paginationSchema>;

export const searchSchema = z.object({
  search: z.string().nullable(),
});
export type SearchType = z.infer<typeof searchSchema>;

export const dateRangeSchema = z.object({
  startDate: dateSchema.nullable(),
  endDate: dateSchema.nullable(),
});
export type DateRangeType = z.infer<typeof dateRangeSchema>;

export const undefinedSchema = z.undefined();
export type UndefinedType = z.input<typeof undefinedSchema>;
