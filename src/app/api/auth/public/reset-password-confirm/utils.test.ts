import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "../../../db";
import { generatePasswordResetToken, verifyPasswordResetToken } from "./utils";

describe("Password Reset Tokens", () => {
  const mockUserId = "test-user-id";
  const mockEmail = "test@example.com";

  // Set up test user in database
  beforeAll(async () => {
    await db.user.upsert({
      where: { id: mockUserId },
      update: { email: mockEmail },
      create: {
        id: mockUserId,
        email: mockEmail,
        firstName: "Test",
        lastName: "User",
        password: "password",
      },
    });
  });

  // Clean up between tests
  beforeEach(async () => {
    // Delete any existing password reset tokens
    await db.passwordReset.deleteMany({
      where: { userId: mockUserId },
    });
  });

  // Clean up after all tests
  afterAll(async () => {
    await db.passwordReset.deleteMany({
      where: { userId: mockUserId },
    });
    await db.user.delete({
      where: { id: mockUserId },
    });
    await db.$disconnect();
  });

  describe("generatePasswordResetToken", () => {
    it("should generate a token and save it to the database", async () => {
      // Generate a real token
      const token = await generatePasswordResetToken(mockEmail, mockUserId);

      // Check that the token was generated and is not empty
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      // Check that the token was stored in the database
      const resetRecord = await db.passwordReset.findFirst({
        where: { userId: mockUserId },
      });

      expect(resetRecord).toBeTruthy();
      expect(resetRecord!.token).toBe(token);
      expect(resetRecord!.userId).toBe(mockUserId);
      expect(resetRecord!.expiresAt > new Date()).toBeTruthy();
    });
  });

  describe("verifyPasswordResetToken", () => {
    it("should verify and return payload for valid token", async () => {
      // Generate a token first
      const token = await generatePasswordResetToken(mockEmail, mockUserId);

      // Verify the token
      const result = await verifyPasswordResetToken(token);

      // Check the payload
      expect(result).toEqual({
        email: mockEmail,
        userId: mockUserId,
      });

      // Check that the token was deleted from the database
      const resetRecord = await db.passwordReset.findFirst({
        where: { userId: mockUserId },
      });

      expect(resetRecord).toBeNull(); // Token should be deleted after verification
    });

    it("should return null if token record not found in database", async () => {
      // Generate a token first
      const token = await generatePasswordResetToken(mockEmail, mockUserId);

      // Delete the token from database to simulate a non-existent token
      await db.passwordReset.delete({
        where: { userId: mockUserId },
      });

      // Try to verify the token
      const result = await verifyPasswordResetToken(token);

      // Should return null as the token doesn't exist in the database
      expect(result).toBeNull();
    });

    it("should return null for expired token", async () => {
      // Generate a token first
      const token = await generatePasswordResetToken(mockEmail, mockUserId);

      // Update the token to be expired
      await db.passwordReset.update({
        where: { userId: mockUserId },
        data: { expiresAt: new Date(Date.now() - 3600000) }, // 1 hour in the past
      });

      // Try to verify the token
      const result = await verifyPasswordResetToken(token);

      // Should return null as the token is expired
      expect(result).toBeNull();
    });

    it("should return null for invalid token format", async () => {
      // Try to verify an invalid token
      const result = await verifyPasswordResetToken("invalid-token-format");

      // Should return null as the token format is invalid
      expect(result).toBeNull();
    });
  });
});
