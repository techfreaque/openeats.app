export const UserRoleValue = {
  PUBLIC: "PUBLIC",
  CUSTOMER: "CUSTOMER",
  PARTNER_ADMIN: "PARTNER_ADMIN",
  PARTNER_EMPLOYEE: "PARTNER_EMPLOYEE",
  COURIER: "COURIER",
  ADMIN: "ADMIN",
} as const;

export type UserRoleValue = (typeof UserRoleValue)[keyof typeof UserRoleValue];

// Export a helper to convert database role types to our internal enum
export const convertPrismaRole = (role: string): UserRoleValue => {
  return role as UserRoleValue;
};

// Alias for convertPrismaRole for better naming with Drizzle
export const convertRole = convertPrismaRole;
