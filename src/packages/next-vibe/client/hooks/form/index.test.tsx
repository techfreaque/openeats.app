import { act, renderHook } from "@testing-library/react";
import type { FormEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { Methods } from "../../../shared/types/endpoint";
import { UserRoleValue } from "../../../shared/types/enums";
import { createEndpoint } from "../../endpoint";
import { useApiForm } from "../mutation-form";
import { useApiStore } from "../store";

// Mock the useApiStore hook
vi.mock("../store", () => ({
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
    role: z.enum([UserRoleValue.CUSTOMER, UserRoleValue.ADMIN]),
    bio: z.string().optional(),
  });

  type TestRequest = z.infer<typeof testSchema>;
  interface TestResponse {
    id: string;
    success: boolean;
  }
  type TestUrlParams = Record<string, never>;

  const testEndpoint = createEndpoint<
    TestRequest,
    TestResponse,
    TestUrlParams,
    Methods.POST,
    "default"
  >({
    description: "Test endpoint",
    method: Methods.POST,
    path: ["test"],
    requestSchema: testSchema,
    responseSchema: z.object({
      id: z.string(),
      success: z.boolean(),
    }),
    requestUrlSchema: z.object({}),
    allowedRoles: [UserRoleValue.CUSTOMER, UserRoleValue.ADMIN],
    errorCodes: {
      400: "Bad request",
      401: "Unauthorized",
      500: "Server error", // Required by type definition
    },
    apiQueryOptions: {
      staleTime: 0,
      cacheTime: 0,
      refetchOnWindowFocus: false,
    },
    examples: {
      payloads: {
        default: {
          name: "John Doe",
          email: "john@example.com",
          role: UserRoleValue.CUSTOMER,
          bio: "Test bio",
        },
      },
      responses: {
        default: {
          id: "123",
          success: true,
        },
      },
      urlPathVariables: {
        default: {},
      },
    },
    fieldDescriptions: {
      name: "User's full name",
      email: "User's email address",
      role: "User's role in the system",
      bio: "User's biography",
    },
  });

  const mockExecuteMutation = vi
    .fn()
    .mockResolvedValue({ id: "123", success: true });

  beforeEach(() => {
    vi.clearAllMocks();
    // Update the mock implementation for executeMutation
    (useApiStore as ReturnType<typeof vi.fn>).mockImplementation(() => ({
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
    const { result } = renderHook(() =>
      useApiForm<TestRequest, TestResponse, TestUrlParams, "default">(
        testEndpoint.POST,
      ),
    );

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
      role: UserRoleValue.CUSTOMER,
    };

    const { result } = renderHook(() =>
      useApiForm<TestRequest, TestResponse, TestUrlParams, "default">(
        testEndpoint.POST,
        { defaultValues },
      ),
    );

    expect(result.current.form.getValues()).toEqual(defaultValues);
  });

  it("should submit form with valid data", async () => {
    const { result } = renderHook(() =>
      useApiForm<TestRequest, TestResponse, TestUrlParams, "default">(
        testEndpoint.POST,
      ),
    );

    // Set valid form values
    act(() => {
      result.current.form.setValue("name", "John Doe");
      result.current.form.setValue("email", "john@example.com");
      result.current.form.setValue("role", UserRoleValue.CUSTOMER);
    });

    // Mock form event
    const mockEvent = {
      preventDefault: vi.fn(),
    } as FormEvent<HTMLFormElement>;

    // Mock success callback
    const onSuccess = vi.fn();

    // Submit form
    await act(() => {
      result.current.submitForm(mockEvent, {
        urlParamVariables: {},
        onSuccess,
      });
      return Promise.resolve(); // Return a promise for act
    });

    // Check that executeMutation was called with correct data
    expect(mockExecuteMutation).toHaveBeenCalledWith(
      testEndpoint.POST,
      {
        name: "John Doe",
        email: "john@example.com",
        role: UserRoleValue.CUSTOMER,
      },
      {},
      {},
    );

    // Check that onSuccess was called
    expect(onSuccess).toHaveBeenCalled();
  });

  it("should handle validation errors", async () => {
    const { result } = renderHook(() =>
      useApiForm<TestRequest, TestResponse, TestUrlParams, "default">(
        testEndpoint.POST,
      ),
    );

    // Set invalid form values
    act(() => {
      result.current.form.setValue("name", ""); // Empty name (invalid)
      result.current.form.setValue("email", "invalid-email"); // Invalid email
      // Missing required role field
    });

    // Mock form event
    const mockEvent = {
      preventDefault: vi.fn(),
    } as FormEvent<HTMLFormElement>;

    // Mock error callback
    const onError = vi.fn();

    // Submit form
    await act(() => {
      result.current.submitForm(mockEvent, {
        urlParamVariables: {},
        onError,
      });
      return Promise.resolve(); // Return a promise for act
    });

    // Check that executeMutation was NOT called
    expect(mockExecuteMutation).not.toHaveBeenCalled();

    // Check that onError was called with validation errors
    expect(onError).toHaveBeenCalled();
    const errorArg = onError.mock.calls?.[0]?.[0] as Error;
    expect(errorArg).toHaveProperty("message");
    expect(errorArg.message).toContain("validation");
  });

  it("should handle API errors", async () => {
    // Mock API error
    const apiError = new Error("API error");
    mockExecuteMutation.mockRejectedValueOnce(apiError);

    const { result } = renderHook(() =>
      useApiForm<TestRequest, TestResponse, TestUrlParams, "default">(
        testEndpoint.POST,
      ),
    );

    // Set valid form values
    act(() => {
      result.current.form.setValue("name", "John Doe");
      result.current.form.setValue("email", "john@example.com");
      result.current.form.setValue("role", UserRoleValue.CUSTOMER);
    });

    // Mock form event
    const mockEvent = {
      preventDefault: vi.fn(),
    } as FormEvent<HTMLFormElement>;

    // Mock error callback
    const onError = vi.fn();

    // Submit form
    await act(() => {
      result.current.submitForm(mockEvent, {
        urlParamVariables: {},
        onError,
      });
      return Promise.resolve(); // Return a promise for act
    });

    // Check that executeMutation was called
    expect(mockExecuteMutation).toHaveBeenCalled();

    // Check that onError was called with API error
    expect(onError).toHaveBeenCalledWith(apiError);
  });

  it("should update form state based on mutation state", () => {
    // Mock mutation state
    (useApiStore as ReturnType<typeof vi.fn>).mockImplementation(() => ({
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

    const { result } = renderHook(() =>
      useApiForm<TestRequest, TestResponse, TestUrlParams, "default">(
        testEndpoint.POST,
      ),
    );

    // Check form state
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.isSubmitSuccessful).toBe(false);
    expect(result.current.submitError).toBeUndefined();
  });

  it("should handle form errors", () => {
    const formError = new Error("Form error");

    // Mock form error state
    (useApiStore as ReturnType<typeof vi.fn>).mockImplementation(() => ({
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

    const { result } = renderHook(() =>
      useApiForm<TestRequest, TestResponse, TestUrlParams, "default">(
        testEndpoint.POST,
      ),
    );

    // Check form state
    expect(result.current.submitError).toBe(formError);
    expect(result.current.errorMessage).toBe(formError.message);
  });
});
