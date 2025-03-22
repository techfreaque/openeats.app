export const UserRoleValue = {
  PUBLIC: "PUBLIC",
  CUSTOMER: "CUSTOMER",
  RESTAURANT_ADMIN: "RESTAURANT_ADMIN",
  RESTAURANT_EMPLOYEE: "RESTAURANT_EMPLOYEE",
  DRIVER: "DRIVER",
  ADMIN: "ADMIN",
} as const;

// eslint-disable-next-line no-redeclare
export type UserRoleValue = (typeof UserRoleValue)[keyof typeof UserRoleValue];

// Export a helper to convert Prisma role types to our internal enum
export const convertPrismaRole = (role: string): UserRoleValue => {
  return role as UserRoleValue;
};
