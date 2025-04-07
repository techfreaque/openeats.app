import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

export enum Day {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

const openingTimeBaseSchema = z.object({
  published: z.boolean().default(false),
  day: z.nativeEnum(Day),
  open: z.number().int().min(0).max(86400),
  close: z.number().int().min(0).max(86400),
  validFrom: dateSchema.nullable(),
  validTo: dateSchema.nullable(),
});

export const openingTimeCreateSchema = openingTimeBaseSchema.extend({
  restaurantId: z.string().uuid({ message: "Valid restaurant ID is required" }),
});
export type OpeningTimeCreateType = z.infer<typeof openingTimeCreateSchema>;

export const openingTimeUpdateSchema = openingTimeCreateSchema.extend({
  id: z.string().uuid(),
});
export type OpeningTimeUpdateType = z.infer<typeof openingTimeUpdateSchema>;

export const openingTimeResponseSchema = openingTimeBaseSchema.extend({
  id: z.string().uuid(),
});
export type OpeningTimeResponseType = z.input<typeof openingTimeResponseSchema>;

export const openingTimesResponseSchema = z.array(openingTimeResponseSchema);
export type OpeningTimesResponseType = z.input<
  typeof openingTimesResponseSchema
>;
