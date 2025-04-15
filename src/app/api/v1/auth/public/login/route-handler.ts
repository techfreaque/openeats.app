import "server-only";

import { compare } from "bcrypt";
import { cookies } from "next/headers";
import type { JwtPayloadType } from "next-vibe/server/endpoints/auth/jwt";
import { signJwt } from "next-vibe/server/endpoints/auth/jwt";
import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { debugLogger, errorLogger } from "next-vibe/shared/utils/logger";

import { env } from "../../../../../../config/env";
import { getFullUser } from "../../me/route-handler/get-me";
import { sessionRepository, userRepository } from "../../repository";
import type { LoginFormInputType, LoginResponseInputType } from "./schema";

/**
 * Login API route handler
 * Provides user authentication functionality
 */

/**
 * Authenticate user with credentials
 * @param props - API handler props
 * @returns Login response with user session
 */
export async function loginUser({
  data,
}: ApiHandlerProps<LoginFormInputType, UndefinedType>): Promise<
  ApiHandlerResult<LoginResponseInputType>
> {
  try {
    const { email, password } = data;
    debugLogger("Login attempt", { email });

    // Find user by email
    const user = await userRepository.findByEmail(email);

    // Type assertion for user object
    interface UserType {
      id: string;
      password: string;
    }

    // Check if user exists
    if (!user) {
      debugLogger("Login failed: User not found", { email });
      return {
        success: false,
        message: "Invalid email or password",
        errorCode: 401,
      };
    }

    // Verify password
    const isPasswordValid = await compare(
      password,
      (user as UserType).password,
    );
    if (!isPasswordValid) {
      debugLogger("Login failed: Invalid password", { email });
      return {
        success: false,
        message: "Invalid email or password",
        errorCode: 401,
      };
    }

    // Create session and return user data
    debugLogger("Login successful", { userId: (user as UserType).id, email });
    return await createSessionAndGetUser((user as UserType).id);
  } catch (error) {
    errorLogger("Error during login", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error during login",
      errorCode: 500,
    };
  }
}

/**
 * Create user session and return user data
 * @param userId - User ID
 * @param setCookies - Whether to set auth cookies
 * @returns Login response with user session
 */
export async function createSessionAndGetUser(
  userId: string,
  setCookies = true,
): Promise<ApiHandlerResult<LoginResponseInputType>> {
  try {
    debugLogger("Creating session for user", { userId });

    // Get full user data
    const user = await getFullUser(userId);

    // Create JWT payload
    const tokenPayload: JwtPayloadType = {
      id: user.id,
    };

    // Sign JWT token
    const token = await signJwt(tokenPayload);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

    // Create a session in the database
    await sessionRepository.createSession(userId, token, expiresAt);

    // Set auth cookies if requested
    if (setCookies) {
      try {
        const cookiesStore = await cookies();
        cookiesStore.set({
          name: "token",
          value: token,
          httpOnly: true,
          path: "/",
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        debugLogger("Auth cookie set successfully", { userId });
      } catch (error) {
        debugLogger("Error setting auth cookie", error);
        // Continue even if cookie setting fails
      }
    }

    // Return session data
    return {
      success: true,
      data: {
        user,
        token,
        expiresAt,
      },
    };
  } catch (error) {
    errorLogger("Error creating session", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error creating session",
      errorCode: 500,
    };
  }
}
