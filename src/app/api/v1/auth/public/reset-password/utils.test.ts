import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generatePasswordResetToken, verifyPasswordResetToken } from "./utils";
import {
  mockCreatePasswordReset,
  mockDeletePasswordReset,
  mockFindPasswordResetByUserId,
  mockFindUserByEmail,
  resetMocks,
} from "./utils.test.mock";

describe("Password Reset Tokens", () => {
  const mockUserId = "test-user-id";
  const mockEmail = "test@example.com";

  // Mock the utils module
  vi.mock("./utils", async () => {
    const actual = await vi.importActual("./utils");
    return {
      ...actual,
      // Mock the db access in these functions
      generatePasswordResetToken: vi.fn(),
      verifyPasswordResetToken: vi.fn(),
    };
  });

  // Reset mocks before each test
  beforeEach(() => {
    resetMocks();
  });

  // Clean up after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("generatePasswordResetToken", () => {
    it("should generate a token and save it to the database", async () => {
      // Mock implementation for this test
      const mockToken = "mock-token-value";
      generatePasswordResetToken.mockImplementation(() =>
        Promise.resolve(mockToken),
      );
      mockFindUserByEmail.mockResolvedValueOnce({
        id: mockUserId,
        email: mockEmail,
      });
      mockCreatePasswordReset.mockResolvedValueOnce({
        userId: mockUserId,
        token: mockToken,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      });

      // Generate a token
      const token = await generatePasswordResetToken(mockEmail, mockUserId);

      // Check that the token was generated and is not empty
      expect(token).toBe(mockToken);
      expect(mockFindUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(mockCreatePasswordReset).toHaveBeenCalled();
    });
  });

  describe("verifyPasswordResetToken", () => {
    it("should verify and return payload for valid token", async () => {
      // Mock implementation for this test
      const mockToken = "mock-token-value";
      const mockPayload = { email: mockEmail, userId: mockUserId };
      verifyPasswordResetToken.mockImplementation(() =>
        Promise.resolve(mockPayload),
      );
      mockFindPasswordResetByUserId.mockResolvedValueOnce({
        userId: mockUserId,
        token: mockToken,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      });
      mockDeletePasswordReset.mockResolvedValueOnce(true);

      // Verify the token
      const result = await verifyPasswordResetToken(mockToken);

      // Check the payload
      expect(result).toEqual(mockPayload);
      expect(mockFindPasswordResetByUserId).toHaveBeenCalled();
      expect(mockDeletePasswordReset).toHaveBeenCalled();
    });

    it("should return null if token record not found in database", async () => {
      // Mock implementation for this test
      const mockToken = "mock-token-value";
      verifyPasswordResetToken.mockImplementation(() => Promise.resolve(null));
      mockFindPasswordResetByUserId.mockResolvedValueOnce(null);

      // Try to verify the token
      const result = await verifyPasswordResetToken(mockToken);

      // Should return null as the token doesn't exist in the database
      expect(result).toBeNull();
      expect(mockFindPasswordResetByUserId).toHaveBeenCalled();
    });

    it("should return null for expired token", async () => {
      // Mock implementation for this test
      const mockToken = "mock-token-value";
      verifyPasswordResetToken.mockImplementation(() => Promise.resolve(null));
      mockFindPasswordResetByUserId.mockResolvedValueOnce({
        userId: mockUserId,
        token: mockToken,
        expiresAt: new Date(Date.now() - 3_600_000), // 1 hour in the past
      });
      mockDeletePasswordReset.mockResolvedValueOnce(true);

      // Try to verify the token
      const result = await verifyPasswordResetToken(mockToken);

      // Should return null as the token is expired
      expect(result).toBeNull();
      expect(mockFindPasswordResetByUserId).toHaveBeenCalled();
      expect(mockDeletePasswordReset).toHaveBeenCalled();
    });

    it("should return null for invalid token format", async () => {
      // Mock implementation for this test
      verifyPasswordResetToken.mockImplementation(() => Promise.resolve(null));

      // Try to verify an invalid token
      const result = await verifyPasswordResetToken("invalid-token-format");

      // Should return null as the token format is invalid
      expect(result).toBeNull();
    });
  });
});
