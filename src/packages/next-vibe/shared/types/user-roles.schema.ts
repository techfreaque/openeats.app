import { z } from "zod";

import { UserRoleValue } from "./enums";

const userRoleTypeSchema = z.enum([
  UserRoleValue.PUBLIC,
  UserRoleValue.CUSTOMER,
  UserRoleValue.COURIER,
  UserRoleValue.PARTNER_ADMIN,
  UserRoleValue.PARTNER_EMPLOYEE,
  UserRoleValue.ADMIN,
]);

const userRoleRestaurantTypeSchema = z.enum([
  UserRoleValue.PARTNER_ADMIN,
  UserRoleValue.PARTNER_EMPLOYEE,
]);

export const userRoleRestaurantCreateSchema = z.object({
  role: userRoleRestaurantTypeSchema,
  userId: z.string().uuid(),
});
export type UserRoleRestaurantCreateType = z.infer<
  typeof userRoleRestaurantCreateSchema
>;

export const userRoleAdminCreateSchema = z.object({
  role: userRoleTypeSchema,
});

export const userRoleRestaurantResponseSchema = z.object({
  id: z.string().uuid(),
  role: userRoleTypeSchema,
  userId: z.string().uuid(),
});
export type UserRoleRestaurantResponseType = z.input<
  typeof userRoleRestaurantResponseSchema
>;

export const userRoleRestaurantUpdateSchema =
  userRoleRestaurantCreateSchema.extend({
    id: z.string().uuid(),
  });
export type UserRoleRestaurantUpdateType = z.infer<
  typeof userRoleRestaurantUpdateSchema
>;

export const userRoleResponseSchema = z.object({
  id: z.string().uuid(),
  role: userRoleTypeSchema,
  partnerId: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .transform((val) => val ?? undefined),
});
export type UserRoleResponseType = z.input<typeof userRoleResponseSchema>;
