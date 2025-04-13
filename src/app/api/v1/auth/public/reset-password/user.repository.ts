/**
 * User repository for password reset functionality
 * Provides database access for user-related operations
 */

import { eq } from "drizzle-orm";

import { db } from "../../../../../../packages/next-vibe/server/db";
import { users } from "../../me/users.db";

/**
 * Find a user by email
 * @param email - User email
 * @returns User or undefined if not found
 */
export async function findUserByEmail(
  email: string,
): Promise<{ id: string; firstName: string; email: string } | undefined> {
  const result = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, email));

  return result.length > 0 ? result[0] : undefined;
}
