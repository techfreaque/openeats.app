import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
  image: z.string().url({ message: "Image must be a valid URL" }),
});

export const categoryUpdateSchema = categoryCreateSchema.extend({
  id: z.string().uuid(),
});

export const categoryResponseSchema = categoryUpdateSchema;
