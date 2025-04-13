import { act, renderHook } from "@testing-library/react";
import type { ApiEndpoint } from "next-vibe/client/endpoint";
import { Methods, UserRoleValue } from "next-vibe/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { useAiForm } from "./index";
import { ChatMessageRole, FieldParsingStatus } from "./types";

vi.mock("../../../shared/endpoints/ai-chat", () => ({
  llmApiEndpoint: {
    POST: {
      getRequestData: vi.fn().mockReturnValue({
        success: true,
        endpointUrl: "/api/v1/ai/chat",
        postBody: "{}",
      }),
    },
  },
}));

const mockFetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        success: true,
        data: {
          message: {
            role: ChatMessageRole.ASSISTANT,
            content: "Mock response",
          },
          parsedFields: {
            name: "John Doe",
            email: "john@example.com",
          },
        },
      }),
  }),
);

global.fetch = mockFetch;

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

describe("useAiForm", () => {
  // Create a test endpoint
  const testSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    role: z.enum([UserRoleValue.CUSTOMER, UserRoleValue.ADMIN]),
    bio: z.string().optional(),
  });

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
    allowedRoles: [UserRoleValue.CUSTOMER, UserRoleValue.ADMIN],
    errorCodes: {
      400: "Bad request",
      401: "Unauthorized",
      500: "Server error",
    },
    getRequestData: vi.fn().mockReturnValue({
      success: true,
      endpointUrl: "/api/test",
      postBody: "{}",
    }),
    requiresAuthentication: false,
  } as unknown as ApiEndpoint<
    z.infer<typeof testSchema>,
    { id: string; success: boolean },
    Record<string, never>,
    unknown
  >;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default options", () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    expect(result.current).toHaveProperty("form");
    expect(result.current).toHaveProperty("submitForm");
    expect(result.current).toHaveProperty("chatMessages");
    expect(result.current).toHaveProperty("sendUserMessage");
    expect(result.current).toHaveProperty("startAiFormFilling");
    expect(result.current).toHaveProperty("resetChat");
    expect(result.current).toHaveProperty("isAiProcessing");
    expect(result.current).toHaveProperty("fieldParsingResults");
    expect(result.current).toHaveProperty("submitViaChat");
    expect(result.current).toHaveProperty("getFormSummary");
    expect(result.current).toHaveProperty("getMissingFields");

    // Check initial chat messages
    expect(result.current.chatMessages).toHaveLength(1);
    expect(result.current.chatMessages?.[0]?.role).toBe(ChatMessageRole.SYSTEM);
  });

  it("should initialize with custom options", () => {
    const customSystemPrompt = "Custom system prompt";
    const { result } = renderHook(() =>
      useAiForm(testEndpoint, {
        systemPrompt: customSystemPrompt,
        autoStart: true,
        maxRetries: 5,
        retryDelayMs: 2000,
      }),
    );

    expect(result.current.chatMessages?.[0]?.content).toBe(customSystemPrompt);
  });

  it("should send user messages and process AI responses", async () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    await act(async () => {
      await result.current.sendUserMessage("My name is John Doe");
    });

    // Check that the message was added to chat
    expect(result.current.chatMessages).toHaveLength(3); // System + User + Assistant
    expect(result.current.chatMessages?.[1]?.role).toBe(ChatMessageRole.USER);
    expect(result.current.chatMessages?.[1]?.content).toBe(
      "My name is John Doe",
    );
    expect(result.current.chatMessages?.[2]?.role).toBe(
      ChatMessageRole.ASSISTANT,
    );

    expect(mockFetch).toHaveBeenCalled();

    // Check that form fields were updated
    expect(result.current.form.getValues()).toEqual({
      name: "John Doe",
      email: "john@example.com",
    });
  });

  it("should start AI form filling process", async () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    await act(async () => {
      await result.current.startAiFormFilling();
    });

    // Check that the initial prompt was sent
    expect(result.current.chatMessages).toHaveLength(3); // System + User + Assistant
    expect(result.current.chatMessages?.[1]?.role).toBe(ChatMessageRole.USER);
    expect(result.current.chatMessages?.[1]?.content).toContain(
      "I need to fill out a form",
    );

    expect(mockFetch).toHaveBeenCalled();
  });

  it("should reset chat", () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    // Add some messages
    act(() => {
      result.current.resetChat();
    });

    // Check that chat was reset
    expect(result.current.chatMessages).toHaveLength(1);
    expect(result.current.chatMessages?.[0]?.role).toBe(ChatMessageRole.SYSTEM);
  });

  it("should get form summary", () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    // Set some form values
    act(() => {
      result.current.form.setValue("name", "John Doe");
      result.current.form.setValue("email", "john@example.com");
    });

    // Get form summary
    const summary = result.current.getFormSummary();

    // Check summary content
    expect(summary).toContain("Current form state");
    expect(summary).toContain("name: John Doe");
    expect(summary).toContain("email: john@example.com");
  });

  it("should get missing fields", () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    // Set some form values but leave others empty
    act(() => {
      result.current.form.setValue("name", "John Doe");
      // Leave email and role empty
    });

    // Get missing fields
    const missingFields = result.current.getMissingFields();

    // Check missing fields
    expect(missingFields).toContain("email");
    expect(missingFields).toContain("role");
    expect(missingFields).not.toContain("name");
    // bio is optional, so it shouldn't be in missing fields
    expect(missingFields).not.toContain("bio");
  });

  it("should submit form via chat", async () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    // Set valid form values
    act(() => {
      result.current.form.setValue("name", "John Doe");
      result.current.form.setValue("email", "john@example.com");
      result.current.form.setValue("role", UserRoleValue.CUSTOMER);
    });

    // Submit via chat
    await act(async () => {
      await result.current.submitViaChat();
    });

    // Check that success message was added to chat
    const lastMessage =
      result.current.chatMessages?.[result.current.chatMessages?.length - 1];
    expect(lastMessage?.role).toBe(ChatMessageRole.ASSISTANT);
    expect(lastMessage?.content).toContain(
      "Great! The form has been submitted successfully",
    );
  });

  it("should handle validation errors during submission", async () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    // Set invalid form values
    act(() => {
      result.current.form.setValue("name", "John Doe");
      result.current.form.setValue("email", "invalid-email"); // Invalid email
      // Missing required role field
    });

    // Submit via chat
    await act(async () => {
      await result.current.submitViaChat();
    });

    // Check that error message was added to chat
    const lastMessage =
      result.current.chatMessages?.[result.current.chatMessages?.length - 1];
    expect(lastMessage?.role).toBe(ChatMessageRole.ASSISTANT);
    expect(lastMessage?.content).toContain("There are some validation errors");
    expect(lastMessage?.content).toContain("Invalid email format");
  });

  it("should handle custom field parsers", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              message: {
                role: ChatMessageRole.ASSISTANT,
                content: "Mock response",
              },
              parsedFields: {
                name: "John Doe",
                birthDate: "2000-01-01",
              },
            },
          }),
      }),
    );

    // Create a custom schema with a date field
    const customSchema = z.object({
      name: z.string(),
      birthDate: z.date(),
    });

    const customEndpoint = {
      description: "Test endpoint with date",
      method: Methods.POST,
      path: ["test-date"],
      requestSchema: customSchema,
      responseSchema: z.object({ success: z.boolean() }),
      requestUrlSchema: z.object({}),
      allowedRoles: [UserRoleValue.CUSTOMER],
      errorCodes: { 400: "Bad request", 500: "Server error" },
      getRequestData: vi.fn().mockReturnValue({
        success: true,
        endpointUrl: "/api/test-date",
        postBody: "{}",
      }),
      requiresAuthentication: false,
    } as unknown as ApiEndpoint<
      z.infer<typeof customSchema>,
      { success: boolean },
      Record<string, never>,
      unknown
    >;

    // Create a custom field parser for the date
    const fieldParsers = {
      birthDate: (value: string) => value as unknown as string, // Cast to string to satisfy type constraints
    } as Record<string, (value: string) => string | number | boolean | null>;

    const { result } = renderHook(() =>
      useAiForm(customEndpoint, { fieldParsers }),
    );

    await act(async () => {
      await result.current.sendUserMessage(
        "My name is John and I was born on 2000-01-01",
      );
    });

    // Check that the date was parsed correctly
    const formValues = result.current.form.getValues();
    expect(formValues["birthDate"]).toBeTruthy();
  });

  it("should track field parsing results", async () => {
    const { result } = renderHook(() => useAiForm(testEndpoint));

    await act(async () => {
      await result.current.sendUserMessage(
        "My name is John Doe and my email is john@example.com",
      );
    });

    // Check field parsing results
    expect(result.current.fieldParsingResults).toHaveProperty("name");
    expect(result.current.fieldParsingResults).toHaveProperty("email");
    expect(result.current.fieldParsingResults?.["name"]?.status).toBe(
      FieldParsingStatus.SUCCESS,
    );
    expect(result.current.fieldParsingResults?.["email"]?.status).toBe(
      FieldParsingStatus.SUCCESS,
    );
  });
});
