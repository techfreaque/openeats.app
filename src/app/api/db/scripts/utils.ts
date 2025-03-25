import { UserRoleValue } from "next-query-portal/shared/types/enums";

import { db } from "@/app/api/db";

import { createUser } from "../../v1/auth/public/register/route";

export async function createAdminUser(): Promise<void> {
  // will only crate the user if it does not exist
  await createUser(
    {
      id: "e6f5f3f0-3aa7-4b50-9450-a1e88c590b44",
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "password",
      imageUrl: undefined,
      confirmPassword: "password",
    },

    UserRoleValue.ADMIN,
  );
  await db.$disconnect();
}
