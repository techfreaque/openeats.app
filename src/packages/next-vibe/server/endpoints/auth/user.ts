import { cookies } from "next/headers";
import { headers } from "next/headers";

import { UserRoleValue } from "../../../shared/types/enums";
import { getDataProvider } from "../data/data-provider";
import type { JwtPayloadType } from "./jwt";
import { verifyJwt } from "./jwt";

export async function getVerifiedUser(
  roles: UserRoleValue[],
  partnerId?: string,
): Promise<JwtPayloadType | undefined> {
  if (roles.includes(UserRoleValue.PUBLIC)) {
    return { id: "public" };
  }
  const user = await getCurrentUser();
  if (!user) {
    return undefined;
  }

  if (roles.includes(UserRoleValue.CUSTOMER)) {
    return user;
  }

  // Use the data provider instead of direct Prisma access
  const dataProvider = getDataProvider();
  const userRoles = await dataProvider.getUserRoles(user.id);

  // Check for restaurant-specific roles
  if (partnerId) {
    const hasRestaurantRole = userRoles.some(
      (r) =>
        r.partnerId === partnerId && roles.includes(r.role as UserRoleValue),
    );

    if (hasRestaurantRole) {
      return user;
    }
  }

  // Check for general roles
  const hasRequiredRole = userRoles.some((r) =>
    roles.includes(r.role as UserRoleValue),
  );

  if (hasRequiredRole) {
    return user;
  }

  return undefined;
}

/**
 * Gets the current user from the session
 */
export async function getCurrentUser(): Promise<JwtPayloadType | null> {
  try {
    // First check for Auth header
    const authHeader = (await headers()).get("Authorization");
    const headerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader || null;

    // Then check for cookie if no header token
    const token = headerToken || (await cookies()).get("token")?.value;

    if (!token) {
      return null;
    }

    try {
      const payload = await verifyJwt(token);
      if (!payload) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  } catch (error) {
    throw new Error(`Error getting current user, error: ${error}`);
  }
}
