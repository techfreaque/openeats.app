import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  image: z.string({ message: "Image must be a valid URL" }),
});
export type CategoryCreateType = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = categoryCreateSchema.extend({
  id: z.string().uuid(),
});
export type CategoryUpdateType = z.infer<typeof categoryUpdateSchema>;

export const categoryResponseSchema = categoryUpdateSchema;
export type CategoryResponseType = z.input<typeof categoryResponseSchema>;
