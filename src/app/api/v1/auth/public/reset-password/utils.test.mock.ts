/**
 * Mock repository for testing password reset functionality
 */

import { vi } from "vitest";

// Mock user data
const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  password: "password",
};

// Mock password reset data
let mockPasswordReset = null;

// Mock repository functions
export const mockFindUserByEmail = vi.fn().mockImplementation((email) => {
  if (email === mockUser.email) {
    return Promise.resolve({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
    });
  }
  return Promise.resolve(undefined);
});

export const mockFindUserByEmailAndId = vi
  .fn()
  .mockImplementation((email, userId) => {
    if (email === mockUser.email && userId === mockUser.id) {
      return Promise.resolve({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
      });
    }
    return Promise.resolve(undefined);
  });

export const mockUpdateUserPassword = vi
  .fn()
  .mockImplementation((userId, hashedPassword) => {
    if (userId === mockUser.id) {
      mockUser.password = hashedPassword;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  });

// Mock password reset repository functions
export const mockCreatePasswordReset = vi.fn().mockImplementation((data) => {
  mockPasswordReset = {
    ...data,
    id: "test-reset-id",
  };
  return Promise.resolve(mockPasswordReset);
});

export const mockUpdatePasswordReset = vi
  .fn()
  .mockImplementation((userId, data) => {
    if (mockPasswordReset && mockPasswordReset.userId === userId) {
      mockPasswordReset = {
        ...mockPasswordReset,
        ...data,
      };
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  });

export const mockFindPasswordResetByUserId = vi
  .fn()
  .mockImplementation((userId) => {
    if (mockPasswordReset && mockPasswordReset.userId === userId) {
      return Promise.resolve(mockPasswordReset);
    }
    return Promise.resolve(undefined);
  });

export const mockDeletePasswordReset = vi.fn().mockImplementation((userId) => {
  if (mockPasswordReset && mockPasswordReset.userId === userId) {
    mockPasswordReset = null;
    return Promise.resolve(true);
  }
  return Promise.resolve(false);
});

// Reset all mocks and data
export const resetMocks = () => {
  mockPasswordReset = null;
  mockFindUserByEmail.mockClear();
  mockFindUserByEmailAndId.mockClear();
  mockUpdateUserPassword.mockClear();
  mockCreatePasswordReset.mockClear();
  mockUpdatePasswordReset.mockClear();
  mockFindPasswordResetByUserId.mockClear();
  mockDeletePasswordReset.mockClear();
};
