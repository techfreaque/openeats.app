import { z } from "zod";

const userRoleTypeSchema = z.enum([
  "PUBLIC",
  "CUSTOMER",
  "RESTAURANT_ADMIN",
  "RESTAURANT_EMPLOYEE",
  "DRIVER",
  "ADMIN",
]);

const userRoleRestaurantTypeSchema = z.enum([
  "RESTAURANT_ADMIN",
  "RESTAURANT_EMPLOYEE",
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
  restaurantId: z.string().uuid().nullable(),
});
export type UserRoleResponseType = z.input<typeof userRoleResponseSchema>;
