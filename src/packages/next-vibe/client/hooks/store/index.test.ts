import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { Methods } from "../../../shared/types/endpoint";
import { UserRoleValue } from "../../../shared/types/enums";
import { useApiStore } from ".";

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

describe("useApiStore", () => {
  // Create a test endpoint
  const testSchema = z.object({
    name: z.string(),
    email: z.string(),
  });

  // @ts-ignore - Ignore type errors for test endpoint
  const testEndpoint = {
    description: "Test endpoint",
    method: Methods.POST,
    path: ["test"],
    requestSchema: testSchema,
    responseSchema: z.object({
      id: z.string(),
      success: z.boolean(),
    }),
    requestUrlSchema: z.object({}),
    allowedRoles: [UserRoleValue.ADMIN],
    errorCodes: {
      400: "Bad request",
      500: "Server error",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store
    useApiStore.setState({
      queries: {},
      mutations: {},
      forms: {},
      getQueryId: useApiStore.getState().getQueryId,
      getMutationId: useApiStore.getState().getMutationId,
      getFormId: useApiStore.getState().getFormId,
      executeQuery: useApiStore.getState().executeQuery,
      executeMutation: useApiStore.getState().executeMutation,
      setQueryData: useApiStore.getState().setQueryData,
      setQueryError: useApiStore.getState().setQueryError,
      setQueryLoading: useApiStore.getState().setQueryLoading,
      setMutationData: useApiStore.getState().setMutationData,
      setMutationError: useApiStore.getState().setMutationError,
      setMutationPending: useApiStore.getState().setMutationPending,
      setFormError: useApiStore.getState().setFormError,
      clearFormError: useApiStore.getState().clearFormError,
      setFormQueryParams: useApiStore.getState().setFormQueryParams,
      getFormQueryParams: useApiStore.getState().getFormQueryParams,
    });
  });

  it("should generate unique IDs for queries, mutations, and forms", () => {
    const store = useApiStore.getState();

    const queryId = store.getQueryId(["test", "query"]);
    const mutationId = store.getMutationId(testEndpoint);
    const formId = store.getFormId(testEndpoint);

    expect(queryId).toBeDefined();
    expect(mutationId).toBeDefined();
    expect(formId).toBeDefined();

    expect(queryId).not.toBe(mutationId);
    expect(queryId).not.toBe(formId);
    expect(mutationId).not.toBe(formId);
  });

  it("should set and clear form errors", () => {
    const store = useApiStore.getState();
    const formId = store.getFormId(testEndpoint);
    const error = new Error("Test error");

    // Set form error
    store.setFormError(formId, error);

    // Check that error was set
    expect(useApiStore.getState().forms[formId].formError).toBe(error);

    // Clear form error
    store.clearFormError(formId);

    // Check that error was cleared
    expect(useApiStore.getState().forms[formId].formError).toBeNull();
  });

  it("should set and get form query params", () => {
    const store = useApiStore.getState();
    const formId = store.getFormId(testEndpoint);
    const params = { name: "John", email: "john@example.com" };

    // Set query params
    store.setFormQueryParams(formId, params);

    // Get query params
    const retrievedParams = store.getFormQueryParams(formId);

    // Check that params were set and retrieved correctly
    expect(retrievedParams).toEqual(params);
  });

  it("should set mutation data", () => {
    const store = useApiStore.getState();
    const mutationId = store.getMutationId(testEndpoint);
    const data = { id: "123", success: true };

    // Set mutation data
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setMutationData(mutationId, data);

    // Check that data was set
    const state = useApiStore.getState();
    expect(state.mutations[mutationId].data).toBe(data);
    expect(state.mutations[mutationId].isSuccess).toBe(true);
    expect(state.mutations[mutationId].isError).toBe(false);
    expect(state.mutations[mutationId].error).toBeNull();
    expect(state.mutations[mutationId].isPending).toBe(false);
  });

  it("should set mutation error", () => {
    const store = useApiStore.getState();
    const mutationId = store.getMutationId(testEndpoint);
    const error = new Error("Test error");

    // Set mutation error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setMutationError(mutationId, error);

    // Check that error was set
    const state = useApiStore.getState();
    expect(state.mutations[mutationId].error).toBe(error);
    expect(state.mutations[mutationId].isError).toBe(true);
    expect(state.mutations[mutationId].isSuccess).toBe(false);
    expect(state.mutations[mutationId].isPending).toBe(false);
  });

  it("should set mutation pending state", () => {
    const store = useApiStore.getState();
    const mutationId = store.getMutationId(testEndpoint);

    // Set mutation pending
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setMutationPending(mutationId, true);

    // Check that pending state was set
    const state = useApiStore.getState();
    expect(state.mutations[mutationId].isPending).toBe(true);
    expect(state.mutations[mutationId].isError).toBe(false);
    expect(state.mutations[mutationId].isSuccess).toBe(false);

    // Set mutation not pending
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setMutationPending(mutationId, false);

    // Check that pending state was updated
    const updatedState = useApiStore.getState();
    expect(updatedState.mutations[mutationId].isPending).toBe(false);
  });

  it("should set query data", () => {
    const store = useApiStore.getState();
    const queryId = store.getQueryId(["test", "query"]);
    const data = { id: "123", success: true };

    // Set query data
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setQueryData(queryId, data);

    // Check that data was set
    const state = useApiStore.getState();
    expect(state.queries[queryId].data).toBe(data);
    expect(state.queries[queryId].isSuccess).toBe(true);
    expect(state.queries[queryId].isError).toBe(false);
    expect(state.queries[queryId].error).toBeNull();
    expect(state.queries[queryId].isLoading).toBe(false);
    expect(state.queries[queryId].isFetching).toBe(false);
  });

  it("should set query error", () => {
    const store = useApiStore.getState();
    const queryId = store.getQueryId(["test", "query"]);
    const error = new Error("Test error");

    // Set query error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setQueryError(queryId, error);

    // Check that error was set
    const state = useApiStore.getState();
    expect(state.queries[queryId].error).toBe(error);
    expect(state.queries[queryId].isError).toBe(true);
    expect(state.queries[queryId].isSuccess).toBe(false);
    expect(state.queries[queryId].isLoading).toBe(false);
    expect(state.queries[queryId].isFetching).toBe(false);
  });

  it("should set query loading state", () => {
    const store = useApiStore.getState();
    const queryId = store.getQueryId(["test", "query"]);

    // Set query loading
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setQueryLoading(queryId, true, true);

    // Check that loading state was set
    const state = useApiStore.getState();
    expect(state.queries[queryId].isLoading).toBe(true);
    expect(state.queries[queryId].isFetching).toBe(true);
    expect(state.queries[queryId].isLoadingFresh).toBe(true);

    // Set query not loading
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    store.setQueryLoading(queryId, false, false);

    // Check that loading state was updated
    const updatedState = useApiStore.getState();
    expect(updatedState.queries[queryId].isLoading).toBe(false);
    expect(updatedState.queries[queryId].isFetching).toBe(false);
  });

  it("should execute a mutation", async () => {
    // Mock successful API response
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ success: true, data: { id: "123", success: true } }),
    });

    const store = useApiStore.getState();
    const requestData = { name: "John", email: "john@example.com" };

    // Execute mutation
    const result = await store.executeMutation(testEndpoint, requestData, {});

    // Check that fetch was called
    expect(global.fetch).toHaveBeenCalled();

    // Check that result was returned
    expect(result).toEqual({ id: "123", success: true });

    // Check that mutation state was updated
    const mutationId = store.getMutationId(testEndpoint);
    const state = useApiStore.getState();
    expect(state.mutations[mutationId].data).toEqual({
      id: "123",
      success: true,
    });
    expect(state.mutations[mutationId].isSuccess).toBe(true);
    expect(state.mutations[mutationId].isError).toBe(false);
    expect(state.mutations[mutationId].isPending).toBe(false);
  });

  it("should handle mutation errors", async () => {
    // Mock API error response
    (global.fetch as unknown as Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, message: "Bad request" }),
    });

    const store = useApiStore.getState();
    const requestData = { name: "John", email: "john@example.com" };

    // Execute mutation and expect it to throw
    await expect(
      store.executeMutation(testEndpoint, requestData, {}),
    ).rejects.toThrow();

    // Check that mutation state was updated with error
    const mutationId = store.getMutationId(testEndpoint);
    const state = useApiStore.getState();
    expect(state.mutations[mutationId].error).toBeDefined();
    expect(state.mutations[mutationId].isError).toBe(true);
    expect(state.mutations[mutationId].isSuccess).toBe(false);
    expect(state.mutations[mutationId].isPending).toBe(false);
  });
});
