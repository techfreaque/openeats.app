import { dateSchema } from "next-query-portal/shared/types/common.schema";
import { userRoleResponseSchema } from "next-query-portal/shared/types/user-roles.schema";
import { z } from "zod";

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string(),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  imageUrl: z
    .string()
    .url()
    .nullable()
    .transform((url) => url || undefined),
  userRoles: z.array(userRoleResponseSchema),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type UserResponseType = z.infer<typeof userResponseSchema>;
