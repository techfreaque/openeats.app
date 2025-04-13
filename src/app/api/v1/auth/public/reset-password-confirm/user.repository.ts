/**
 * User repository for password reset functionality
 * Provides database access for user-related operations
 */

import { eq } from "drizzle-orm";

import { db } from "../../../../../../packages/next-vibe/server/db";
import { users } from "../../me/users.db";

/**
 * Find a user by email and ID
 * @param email - User email
 * @param userId - User ID
 * @returns User or undefined if not found
 */
export async function findUserByEmailAndId(
  email: string,
  userId: string,
): Promise<{ id: string; email: string } | undefined> {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.email, email) && eq(users.id, userId));

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update user password
 * @param userId - User ID
 * @param hashedPassword - Hashed password
 * @returns Success status
 */
export async function updateUserPassword(
  userId: string,
  hashedPassword: string,
): Promise<boolean> {
  const result = await db
    .update(users)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return result.count > 0;
}
