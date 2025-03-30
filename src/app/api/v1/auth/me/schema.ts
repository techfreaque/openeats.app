import { dateSchema } from "next-vibe/shared/types/common.schema";
import { userRoleResponseSchema } from "next-vibe/shared/types/user-roles.schema";
import { z } from "zod";

export const userPublicResponseSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
});
export type UserPublicResponseType = z.input<typeof userPublicResponseSchema>;

export const userPublicDetailedResponseSchema = z.object({
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
});
export type UserPublicDetailedResponseType = z.input<
  typeof userPublicDetailedResponseSchema
>;

export const userResponseMinimalSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
});
export type UserResponseMinimalType = z.input<typeof userResponseMinimalSchema>;

export const userUpdateRequestSchema = z.object({
  firstName: z.string(),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  imageUrl: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((url) => url ?? undefined),
});
export type UserUpdateRequestType = z.input<typeof userUpdateRequestSchema>;

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  firstName: z.string(),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  imageUrl: z
    .string()
    .url()
    .nullable()
    .optional()
    .transform((url) => url ?? undefined),
  userRoles: z.array(userRoleResponseSchema),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type UserResponseType = z.input<typeof userResponseSchema>;
