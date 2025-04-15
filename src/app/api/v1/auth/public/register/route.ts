import "server-only";

import { hash } from "bcrypt";
import type {
  ApiHandlerProps,
  ApiHandlerResult,
} from "next-vibe/server/endpoints/core/api-handler";
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { userRepository, userRolesRepository } from "../../repository";
import { loginUser } from "../login/route-handler";
import type { LoginResponseInputType } from "../login/schema";
import registerEndpoint from "./definition";
import { renderRegisterMail } from "./email";
import type { RegisterType } from "./schema";

/**
 * Register API route handler
 * Provides user registration functionality
 */

/**
 * POST handler for user registration
 */
export const POST = apiHandler({
  endpoint: registerEndpoint.POST,
  handler: registerUser,
  email: {
    afterHandlerEmails: [
      {
        render: renderRegisterMail,
        ignoreErrors: false,
      },
    ],
  },
});

/**
 * Register a new user
 * @param props - API handler props
 * @returns Login response with user session
 */
async function registerUser(
  props: ApiHandlerProps<RegisterType, UndefinedType>,
): Promise<ApiHandlerResult<LoginResponseInputType>> {
  try {
    debugLogger("Registering new user", { email: props.data.email });

    // Create the user account
    const result = await createUser(props.data);
    const { success } = result;
    const message = "message" in result ? result.message : "";
    const errorCode = "errorCode" in result ? result.errorCode : 500;

    if (success) {
      // Log the user in automatically after registration
      debugLogger("User registered successfully, logging in", {
        email: props.data.email,
      });
      return await loginUser(props);
    }

    // Return error if user creation failed
    debugLogger("User registration failed", { message, errorCode });
    return { success: false, message, errorCode };
  } catch (error) {
    debugLogger("Error during user registration", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error during registration",
      errorCode: 500,
    };
  }
}

/**
 * Create a new user account
 * @param userData - User registration data
 * @param role - User role (default: CUSTOMER)
 * @returns Success or error result
 */
export async function createUser(
  userInput: RegisterType & { id?: string },
  role: UserRoleValue = UserRoleValue.CUSTOMER,
): Promise<ApiHandlerResult<UndefinedType>> {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      imageUrl,
      confirmPassword,
      id,
    } = userInput;

    // Check if email is already registered
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      debugLogger("Registration failed: Email already registered", { email });
      return {
        success: false,
        message: "Email already registered",
        errorCode: 400,
      };
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      debugLogger("Registration failed: Passwords do not match", { email });
      return {
        success: false,
        message: "Passwords do not match",
        errorCode: 400,
      };
    }

    // Create user data object
    const userData = {
      email,
      password,
      firstName,
      lastName,
      imageUrl: imageUrl ?? undefined,
    };

    // Create or update user based on whether ID is provided
    let userId: string;

    if (id) {
      debugLogger("Upserting user with ID", { id, email });

      // Check if user exists
      const existingUser = await userRepository.findById(id);

      if (existingUser) {
        // Update existing user
        await userRepository.updateProfile(id, userData);
        userId = id;
      } else {
        // Create new user with specified ID
        const user = await userRepository.createWithHashedPassword({
          ...userData,
          id,
        });
        userId = user.id;
      }
    } else {
      debugLogger("Creating new user", { email });

      // Create new user with generated ID
      const user = await userRepository.createWithHashedPassword(userData);
      userId = user.id;
    }

    // Add role
    await userRolesRepository.addRole(userId, role);

    debugLogger("User created successfully", { email });
    return { success: true, data: undefined };
  } catch (error) {
    debugLogger("Error creating user", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error creating user",
      errorCode: 500,
    };
  }
}

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await hash(password, 10);
  } catch (error) {
    debugLogger("Error hashing password", error);
    throw new Error("Failed to hash password");
  }
}
