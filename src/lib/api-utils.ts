import type { NextRequest } from "next/server";
import type { JwtPayloadType } from "next-vibe/server/endpoints/auth/jwt";
import { getCurrentUser } from "next-vibe/server/endpoints/auth/user";
import { errorLogger } from "next-vibe/shared/utils/logger";
import type { z } from "zod";

/**
 * Get authenticated user from request
 * @returns Authenticated user information
 */
export const getAuthenticatedUser = async (): Promise<JwtPayloadType> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Authentication failed");
    }
    return user;
  } catch (error) {
    errorLogger("Authentication error", error);
    throw new Error(
      error instanceof Error ? error.message : "Authentication failed",
    );
  }
};

/**
 * Execute database query with error handling
 * @param query - Database query function
 * @param context - Context for error logging
 * @returns Query result
 */
export const executeDbQuery = async <T>(
  query: () => Promise<T>,
  context: string,
): Promise<T> => {
  try {
    return await query();
  } catch (error) {
    errorLogger(`Database error in ${context}`, error);
    throw new Error(
      error instanceof Error ? error.message : `Database error in ${context}`,
    );
  }
};

/**
 * Validate API request against schema
 * @param request - Next.js request object
 * @param schema - Zod schema for validation
 * @returns Validated data
 */
export const validateApiRequest = async <T>(
  request: NextRequest,
  schema: z.ZodType<T>,
): Promise<T> => {
  try {
    const data = await request.json();
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new Error(`Validation error: ${result.error.message}`);
    }

    return result.data;
  } catch (error) {
    errorLogger("API request validation error", error);
    throw new Error(
      error instanceof Error ? error.message : "Invalid request data",
    );
  }
};
