import "server-only";

import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { createSessionAndGetUser } from "../../public/login/route-handler";
import type { LoginResponseInputType } from "../../public/login/schema";
import { userRepository, userRolesRepository } from "../../repository";
import type { UserResponseType } from "../schema";

/**
 * User API handlers
 * Provides user profile management functionality
 */

/**
 * Full user type with roles
 */
export interface FullUserBase {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userRoles: Array<{
    id: string;
    role: string;
    partnerId?: string | null;
  }>;
}

/**
 * Get current user information
 * @param props - API handler props
 * @returns User information with session
 */
export async function getUser({
  user,
}: ApiHandlerProps<UndefinedType, UndefinedType>): Promise<
  ApiHandlerResult<LoginResponseInputType>
> {
  try {
    debugLogger("Getting user information", { userId: user.id });
    return await createSessionAndGetUser(user.id);
  } catch (error) {
    errorLogger("Error getting user information", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    } as ApiHandlerResult<LoginResponseInputType>;
  }
}

/**
 * Full user information including password
 */
export interface FullUser extends UserResponseType {
  password?: string;
}

/**
 * Get full user information including password
 * @param userId - User ID
 * @returns Full user information
 */
export async function getFullUser(userId: string): Promise<FullUser> {
  try {
    debugLogger("Getting full user information", { userId });

    // Get the user
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Get the user roles
    const roles = await userRolesRepository.findByUserId(userId);

    // Define the role type for type safety
    interface UserRoleType {
      id: string;
      role: string;
      partnerId?: string | null;
    }

    // Type assertion for roles array
    const typedRoles = roles as UserRoleType[];

    // Create a properly typed user object with explicit type casting
    const typedUser = user as FullUser;

    // Combine the results with proper typing
    const result: FullUser = {
      ...typedUser,
      userRoles: typedRoles.map((role) => ({
        id: role.id,
        role: role.role as
          | "PUBLIC"
          | "CUSTOMER"
          | "PARTNER_ADMIN"
          | "PARTNER_EMPLOYEE"
          | "COURIER"
          | "ADMIN",
        partnerId: role.partnerId,
      })),
    };

    return result;
  } catch (error) {
    debugLogger("Error getting full user information", error);
    throw error;
  }
}
