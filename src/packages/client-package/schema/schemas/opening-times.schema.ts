import { z } from "zod";

import { dateSchema } from "../../../../packages/next-portal/src/types/common.schema";

const openingTimeBaseSchema = z.object({
  published: z.boolean().default(false),
  day: z.coerce.number().int().min(1).max(7), // 1-7 for Monday-Sunday
  open: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Opening time must be in HH:mm format",
    })
    .optional(),
  close: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Closing time must be in HH:mm format",
    })
    .optional(),
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
