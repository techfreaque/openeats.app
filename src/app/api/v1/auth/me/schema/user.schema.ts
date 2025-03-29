import { dateSchema } from "next-vibe/shared/types/common.schema";
import { userRoleResponseSchema } from "next-vibe/shared/types/user-roles.schema";
import { z } from "zod";

import { addressResponseSchema } from "@/app/api/v1/auth/me/schema/address.schema";

import { cartItemResponseSchema } from "./cart.schema";

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
    .transform((url) => url || undefined),
  userRoles: z.array(userRoleResponseSchema),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  addresses: z.array(addressResponseSchema),
  cartItems: z.array(cartItemResponseSchema),
});
export type UserResponseType = z.infer<typeof userResponseSchema>;
