import { dateSchema } from "next-vibe/shared/types/common.schema";
import { z } from "zod";

import { userResponseSchema } from "../../me/schema";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});
export type LoginFormInputType = z.input<typeof loginSchema>;
export type LoginFormOutputType = z.infer<typeof loginSchema>;

export const loginResponseSchema = z.object({
  user: userResponseSchema,
  expiresAt: dateSchema,
  token: z.string(),
});
export type LoginResponseInputType = z.input<typeof loginResponseSchema>;
export type LoginResponseOutputType = z.infer<typeof loginResponseSchema>;
