import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { env } from "../../../../../../config/env";
import { db } from "../../../../db";
import { passwordResets } from "./reset-password.db";

const SECRET_KEY = new TextEncoder().encode(env.JWT_SECRET_KEY);
const RESET_TOKEN_EXPIRY = "4h";

export interface PasswordResetTokenPayload {
  email: string;
  userId: string;
}

export async function generatePasswordResetToken(
  email: string,
  userId: string,
): Promise<string> {
  // Create a random token to make it more secure
  const randomToken = randomBytes(16).toString("hex");

  // Sign the token with jose
  const token = await new SignJWT({ email, userId, randomToken })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(RESET_TOKEN_EXPIRY)
    .sign(SECRET_KEY);
  // Use the drizzle query builder instead of Prisma-style queries
  const expiryDate = new Date(Date.now() + 4 * 60 * 60 * 1000);

  // Check if a record exists
  const existingRecord = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.userId, userId));

  if (existingRecord.length > 0) {
    // Update existing record
    await db
      .update(passwordResets)
      .set({
        token,
        expiresAt: expiryDate,
      })
      .where(eq(passwordResets.userId, userId));
  } else {
    // Create new record
    await db.insert(passwordResets).values({
      userId,
      token,
      expiresAt: expiryDate,
    });
  }
  return token;
}

// Verify a password reset token and return the email if valid
export async function verifyPasswordResetToken(
  token: string,
): Promise<PasswordResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify<PasswordResetTokenPayload>(
      token,
      SECRET_KEY,
    );

    // Find the reset record using Drizzle
    const resetRecords = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.userId, payload.userId));

    const resetRecord = resetRecords.length > 0 ? resetRecords[0] : null;

    if (!resetRecord) {
      return null;
    }

    // Check if the token has expired
    if (resetRecord.expiresAt < new Date()) {
      // Delete the expired token
      await db
        .delete(passwordResets)
        .where(eq(passwordResets.userId, payload.userId));
      return null;
    }

    // Delete the reset record after successful verification
    await db
      .delete(passwordResets)
      .where(eq(passwordResets.userId, payload.userId));

    return { email: payload.email, userId: payload.userId };
  } catch (error) {
    debugLogger("Invalid token", error);
    return null;
  }
}
