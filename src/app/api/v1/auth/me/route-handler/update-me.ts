import "server-only";

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { formatResponse } from "next-vibe/server/endpoints/core/api-response";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import type { UserResponseType, UserUpdateRequestType } from "../schema";
import { userRepository } from "../../repository";
import { getFullUser } from "./get-me";

/**
 * User update handler
 * Provides functionality to update user profile information
 */

/**
 * Update user profile information
 */
export const updateUser: ApiHandlerFunction<
  UserUpdateRequestType,
  UserResponseType,
  UndefinedType
> = async ({
  user: { id },
  data: { firstName, lastName, imageUrl, email },
}) => {
  try {
    debugLogger("Updating user profile", {
      userId: id,
      email,
      firstName,
      lastName,
    });

    // Check if user exists
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      return {
        success: false,
        message: "User not found",
        errorCode: 404,
      };
    }

    // Type assertion for existingUser
    interface UserType {
      id: string;
      email: string;
    }

    // Check if email is already taken by another user
    if (email !== (existingUser as UserType).email) {
      const emailExists = await userRepository.findByEmail(email);

      if (emailExists && (emailExists as UserType).id !== id) {
        return {
          success: false,
          message: "Email already registered",
          errorCode: 400,
        };
      }
    }

    // Update user profile
    await userRepository.updateProfile(id, {
      firstName,
      lastName,
      email,
      imageUrl: imageUrl ?? undefined,
    });

    // Get updated user information
    const fullUser = await getFullUser(id);

    return formatResponse(fullUser as UserResponseType);
  } catch (error) {
    errorLogger("Error updating user profile", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
};
