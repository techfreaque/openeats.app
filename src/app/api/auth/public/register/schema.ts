import { z } from "zod";

const registerBaseSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  imageUrl: z.string().url().optional(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Password confirmation is required" }),
});

export const registerSchema = registerBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  },
);
export type RegisterType = z.infer<typeof registerSchema>;
