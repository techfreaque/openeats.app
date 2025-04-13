import { act, renderHook } from "@testing-library/react";
import { createEndpoint } from "next-vibe/client/endpoint";
import { Methods, UserRoleValue } from "next-vibe/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useApiQuery } from ".";

// Mock the useApiStore hook
vi.mock("../../../../client/hooks/store", () => ({
  useApiStore: vi.fn().mockImplementation(() => ({
    executeQuery: vi
      .fn()
      .mockResolvedValue({ success: true, data: [{ id: "1", name: "Test" }] }),
    getQueryId: vi.fn().mockReturnValue("test-query-id"),
    queries: {
      "test-query-id": {
        data: [{ id: "1", name: "Test" }],
        error: null,
        isLoading: false,
        isFetching: false,
        isError: false,
        isSuccess: true,
        isLoadingFresh: false,
        isCachedData: true,
        statusMessage: "Success",
        lastFetchTime: Date.now(),
      },
    },
  })),
}));

describe("useApiQuery", () => {
  // Create a test endpoint
  const testSchema = z.object({
    search: z.string().optional(),
    limit: z.number().optional(),
  });

  const testResponseSchema = z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  );

  const testEndpoint = createEndpoint({
    description: "Test query endpoint",
    method: Methods.GET,
    path: ["test", "query"],
    requestSchema: testSchema,
    responseSchema: testResponseSchema,
    requestUrlSchema: z.object({}),
    allowedRoles: [UserRoleValue.USER],
    errorCodes: {
      400: "Bad request",
    },
  });

  const mockExecuteQuery = vi
    .fn()
    .mockResolvedValue([{ id: "1", name: "Test" }]);

  beforeEach(() => {
    vi.clearAllMocks();
    // Update the mock implementation for executeQuery
    useApiStore.mockImplementation(() => ({
      executeQuery: mockExecuteQuery,
      getQueryId: vi.fn().mockReturnValue("test-query-id"),
      queries: {
        "test-query-id": {
          data: [{ id: "1", name: "Test" }],
          error: null,
          isLoading: false,
          isFetching: false,
          isError: false,
          isSuccess: true,
          isLoadingFresh: false,
          isCachedData: true,
          statusMessage: "Success",
          lastFetchTime: Date.now(),
        },
      },
    }));
  });

  it("should initialize with default options", () => {
    const { result } = renderHook(() =>
      useApiQuery(testEndpoint, { search: "test" }, {}),
    );

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("isFetching");
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("isSuccess");
    expect(result.current).toHaveProperty("isLoadingFresh");
    expect(result.current).toHaveProperty("isCachedData");
    expect(result.current).toHaveProperty("statusMessage");
    expect(result.current).toHaveProperty("status");
    expect(result.current).toHaveProperty("refetch");
    expect(result.current).toHaveProperty("remove");
  });

  it("should execute query on mount", () => {
    renderHook(() => useApiQuery(testEndpoint, { search: "test" }, {}));

    // Check that executeQuery was called
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      testEndpoint,
      { search: "test" },
      {},
      expect.objectContaining({
        enabled: true,
      }),
    );
  });

  it("should not execute query when enabled is false", () => {
    renderHook(() =>
      useApiQuery(testEndpoint, { search: "test" }, {}, { enabled: false }),
    );

    // Check that executeQuery was not called
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("should refetch when dependencies change", () => {
    const { rerender } = renderHook(
      (props) => useApiQuery(testEndpoint, props.params, {}),
      {
        initialProps: { params: { search: "test1" } },
      },
    );

    // First call to executeQuery
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      testEndpoint,
      { search: "test1" },
      {},
      expect.anything(),
    );

    // Reset mock to check for second call
    mockExecuteQuery.mockClear();

    // Change params
    rerender({ params: { search: "test2" } });

    // Check that executeQuery was called again with new params
    expect(mockExecuteQuery).toHaveBeenCalledWith(
      testEndpoint,
      { search: "test2" },
      {},
      expect.anything(),
    );
  });

  it("should call onSuccess callback when query succeeds", async () => {
    const onSuccess = vi.fn();

    renderHook(() =>
      useApiQuery(testEndpoint, { search: "test" }, {}, { onSuccess }),
    );

    // Check that onSuccess was called with the data
    expect(onSuccess).toHaveBeenCalledWith([{ id: "1", name: "Test" }]);
  });

  it("should handle query errors", async () => {
    const error = new Error("Query error");
    mockExecuteQuery.mockRejectedValueOnce(error);

    const onError = vi.fn();

    // Mock error state
    useApiStore.mockImplementation(() => ({
      executeQuery: mockExecuteQuery,
      getQueryId: vi.fn().mockReturnValue("test-query-id"),
      queries: {
        "test-query-id": {
          data: undefined,
          error: error,
          isLoading: false,
          isFetching: false,
          isError: true,
          isSuccess: false,
          isLoadingFresh: false,
          isCachedData: false,
          statusMessage: "Error",
          lastFetchTime: Date.now(),
        },
      },
    }));

    const { result } = renderHook(() =>
      useApiQuery(testEndpoint, { search: "test" }, {}, { onError }),
    );

    // Check that onError was called with the error
    expect(onError).toHaveBeenCalledWith(error);

    // Check query state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });

  it("should refetch data when refetch is called", async () => {
    const { result } = renderHook(() =>
      useApiQuery(testEndpoint, { search: "test" }, {}),
    );

    // Reset mock to check for refetch call
    mockExecuteQuery.mockClear();

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Check that executeQuery was called again
    expect(mockExecuteQuery).toHaveBeenCalled();
  });

  it("should handle loading states", () => {
    // Mock loading state
    useApiStore.mockImplementation(() => ({
      executeQuery: mockExecuteQuery,
      getQueryId: vi.fn().mockReturnValue("test-query-id"),
      queries: {
        "test-query-id": {
          data: undefined,
          error: null,
          isLoading: true,
          isFetching: true,
          isError: false,
          isSuccess: false,
          isLoadingFresh: true,
          isCachedData: false,
          statusMessage: "Loading",
          lastFetchTime: null,
        },
      },
    }));

    const { result } = renderHook(() =>
      useApiQuery(testEndpoint, { search: "test" }, {}),
    );

    // Check loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.isLoadingFresh).toBe(true);
    expect(result.current.status).toBe("loading");
  });

  it("should handle cached data", () => {
    // Mock cached data state
    useApiStore.mockImplementation(() => ({
      executeQuery: mockExecuteQuery,
      getQueryId: vi.fn().mockReturnValue("test-query-id"),
      queries: {
        "test-query-id": {
          data: [{ id: "1", name: "Test" }],
          error: null,
          isLoading: false,
          isFetching: true,
          isError: false,
          isSuccess: true,
          isLoadingFresh: false,
          isCachedData: true,
          statusMessage: "Success (cached)",
          lastFetchTime: Date.now() - 60000, // 1 minute ago
        },
      },
    }));

    const { result } = renderHook(() =>
      useApiQuery(testEndpoint, { search: "test" }, {}),
    );

    // Check cached data state
    expect(result.current.isCachedData).toBe(true);
    expect(result.current.data).toEqual([{ id: "1", name: "Test" }]);
    expect(result.current.isFetching).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });
});
