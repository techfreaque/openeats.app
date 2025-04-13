import { act, renderHook } from "@testing-library/react";
import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods, UserRoleValue } from "next-vibe/shared";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useApiForm } from "../mutation-form";

// Mock the useApiStore hook
vi.mock("../../../../client/hooks/store", () => ({
  useApiStore: vi.fn().mockImplementation(() => ({
    executeMutation: vi.fn().mockResolvedValue({ success: true }),
    getMutationId: vi.fn().mockReturnValue("test-mutation-id"),
    getFormId: vi.fn().mockReturnValue("test-form-id"),
    setFormError: vi.fn(),
    clearFormError: vi.fn(),
    mutations: {},
    forms: {},
  })),
}));

describe("useApiForm", () => {
  // Create a test endpoint
  const testSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    role: z.enum([UserRoleValue.USER, UserRoleValue.ADMIN]),
    bio: z.string().optional(),
  });

  const testEndpoint = createEndpoint({
    description: "Test endpoint",
    method: Methods.POST,
    path: ["test"],
    requestSchema: testSchema,
    responseSchema: z.object({
      id: z.string(),
      success: z.boolean(),
    }),
    requestUrlSchema: z.object({}),
    allowedRoles: [UserRoleValue.USER, UserRoleValue.ADMIN],
    errorCodes: {
      400: "Bad request",
      401: "Unauthorized",
    },
  });

  const mockExecuteMutation = vi
    .fn()
    .mockResolvedValue({ id: "123", success: true });

  beforeEach(() => {
    vi.clearAllMocks();
    // Update the mock implementation for executeMutation
    useApiStore.mockImplementation(() => ({
      executeMutation: mockExecuteMutation,
      getMutationId: vi.fn().mockReturnValue("test-mutation-id"),
      getFormId: vi.fn().mockReturnValue("test-form-id"),
      setFormError: vi.fn(),
      clearFormError: vi.fn(),
      mutations: {
        "test-mutation-id": {
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
          data: undefined,
        },
      },
      forms: {
        "test-form-id": {
          formError: null,
          isSubmitting: false,
        },
      },
    }));
  });

  it("should initialize with default options", () => {
    const { result } = renderHook(() => useApiForm(testEndpoint));

    expect(result.current).toHaveProperty("form");
    expect(result.current).toHaveProperty("submitForm");
    expect(result.current).toHaveProperty("isSubmitting");
    expect(result.current).toHaveProperty("isSubmitSuccessful");
    expect(result.current).toHaveProperty("submitError");
    expect(result.current).toHaveProperty("errorMessage");
  });

  it("should initialize with default values", () => {
    const defaultValues = {
      name: "John Doe",
      email: "john@example.com",
      role: UserRoleValue.USER,
    };

    const { result } = renderHook(() =>
      useApiForm(testEndpoint, { defaultValues }),
    );

    expect(result.current.form.getValues()).toEqual(defaultValues);
  });

  it("should submit form with valid data", async () => {
    const { result } = renderHook(() => useApiForm(testEndpoint));

    // Set valid form values
    act(() => {
      result.current.form.setValue("name", "John Doe");
      result.current.form.setValue("email", "john@example.com");
      result.current.form.setValue("role", UserRoleValue.USER);
    });

    // Mock form event
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as FormEvent<HTMLFormElement>;

    // Mock success callback
    const onSuccess = vi.fn();

    // Submit form
    await act(async () => {
      result.current.submitForm(mockEvent, {
        urlParamVariables: {},
        onSuccess,
      });
    });

    // Check that executeMutation was called with correct data
    expect(mockExecuteMutation).toHaveBeenCalledWith(
      testEndpoint,
      {
        name: "John Doe",
        email: "john@example.com",
        role: UserRoleValue.USER,
      },
      {},
      {},
    );

    // Check that onSuccess was called
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle validation errors", async () => {
    const { result } = renderHook(() => useApiForm(testEndpoint));

    // Set invalid form values
    act(() => {
      result.current.form.setValue("name", ""); // Empty name (invalid)
      result.current.form.setValue("email", "invalid-email"); // Invalid email
      // Missing required role field
    });

    // Mock form event
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as FormEvent<HTMLFormElement>;

    // Mock error callback
    const onError = vi.fn();

    // Submit form
    await act(async () => {
      result.current.submitForm(mockEvent, {
        urlParamVariables: {},
        onError,
      });
    });

    // Check that executeMutation was NOT called
    expect(mockExecuteMutation).not.toHaveBeenCalled();

    // Check that onError was called with validation errors
    expect(onError).toHaveBeenCalled();
    const errorArg = onError.mock.calls[0][0];
    expect(errorArg).toHaveProperty("message");
    expect(errorArg.message).toContain("validation");
  });

  it("should handle API errors", async () => {
    // Mock API error
    const apiError = new Error("API error");
    mockExecuteMutation.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useApiForm(testEndpoint));

    // Set valid form values
    act(() => {
      result.current.form.setValue("name", "John Doe");
      result.current.form.setValue("email", "john@example.com");
      result.current.form.setValue("role", UserRoleValue.USER);
    });

    // Mock form event
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as FormEvent<HTMLFormElement>;

    // Mock error callback
    const onError = vi.fn();

    // Submit form
    await act(async () => {
      result.current.submitForm(mockEvent, {
        urlParamVariables: {},
        onError,
      });
    });

    // Check that executeMutation was called
    expect(mockExecuteMutation).toHaveBeenCalled();

    // Check that onError was called with API error
    expect(onError).toHaveBeenCalledWith(apiError);
  });

  it("should update form state based on mutation state", () => {
    // Mock mutation state
    useApiStore.mockImplementation(() => ({
      executeMutation: mockExecuteMutation,
      getMutationId: vi.fn().mockReturnValue("test-mutation-id"),
      getFormId: vi.fn().mockReturnValue("test-form-id"),
      setFormError: vi.fn(),
      clearFormError: vi.fn(),
      mutations: {
        "test-mutation-id": {
          isPending: true,
          isError: false,
          error: null,
          isSuccess: false,
          data: undefined,
        },
      },
      forms: {
        "test-form-id": {
          formError: null,
          isSubmitting: true,
        },
      },
    }));

    const { result } = renderHook(() => useApiForm(testEndpoint));

    // Check form state
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.isSubmitSuccessful).toBe(false);
    expect(result.current.submitError).toBeUndefined();
  });

  it("should handle form errors", () => {
    const formError = new Error("Form error");

    // Mock form error state
    useApiStore.mockImplementation(() => ({
      executeMutation: mockExecuteMutation,
      getMutationId: vi.fn().mockReturnValue("test-mutation-id"),
      getFormId: vi.fn().mockReturnValue("test-form-id"),
      setFormError: vi.fn(),
      clearFormError: vi.fn(),
      mutations: {
        "test-mutation-id": {
          isPending: false,
          isError: false,
          error: null,
          isSuccess: false,
          data: undefined,
        },
      },
      forms: {
        "test-form-id": {
          formError: formError,
          isSubmitting: false,
        },
      },
    }));

    const { result } = renderHook(() => useApiForm(testEndpoint));

    // Check form state
    expect(result.current.submitError).toBe(formError);
    expect(result.current.errorMessage).toBe(formError.message);
  });
});
