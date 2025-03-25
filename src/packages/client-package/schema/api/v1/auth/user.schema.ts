import { z } from "zod";

import { dateSchema } from "../../../../../../packages/next-portal/src/types/common.schema";
import { userRoleResponseSchema } from "../../../../../../packages/next-portal/src/types/user-roles.schema";
import { addressResponseSchema } from "../../../schemas/address.schema";
import { cartItemResponseSchema } from "../../../schemas/cart.schema";

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
  firstName: z.string().min(1, { message: "First Name is required" }),
  lastName: z.string().min(1, { message: "Last Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  userRoles: z.array(userRoleResponseSchema),
  imageUrl: z.string().nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  addresses: z.array(addressResponseSchema),
  cartItems: z.array(cartItemResponseSchema),
});
export type UserResponseType = z.input<typeof userResponseSchema>;
