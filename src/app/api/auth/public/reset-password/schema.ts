import { z } from "zod";

export const resetPasswordRequestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});
export type ResetPasswordRequestType = z.infer<
  typeof resetPasswordRequestSchema
>;

export const resetPasswordConfirmSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    token: z.string(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password confirmation is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordConfirmType = z.infer<
  typeof resetPasswordConfirmSchema
>;
