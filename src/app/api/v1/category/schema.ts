import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  image: z.string().url({ message: "Image must be a valid URL" }),
  parentCategoryId: z.string().uuid().optional().nullable(),
  published: z.boolean().optional().default(true),
});
export type CategoryCreateType = z.input<typeof categoryCreateSchema>;

export const categoryUpdateSchema = categoryCreateSchema.extend({
  id: z.string().uuid(),
});
export type CategoryUpdateType = z.input<typeof categoryUpdateSchema>;

export const categoryResponseSchema = categoryUpdateSchema;
export type CategoryResponseType = z.input<typeof categoryResponseSchema>;
