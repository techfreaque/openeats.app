import { z } from "zod";

export const resetPasswordRequestSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});
export type ResetPasswordRequestType = z.infer<
  typeof resetPasswordRequestSchema
>;
