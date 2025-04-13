import { describe, expect, it, vi } from "vitest";

import { mockLlmApi } from "../../../../client/hooks/ai-form/mock-api";
import { ChatMessageRole } from "../../../../client/hooks/ai-form/types";

describe("mockLlmApi", () => {
  // Mock the setTimeout function
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return a default response when no user message is provided", async () => {
    const messages = [
      {
        role: ChatMessageRole.SYSTEM,
        content: "I am a system message",
        timestamp: new Date(),
      },
    ];

    const promise = mockLlmApi({ messages });
    vi.runAllTimers();
    const response = await promise;

    expect(response).toEqual({
      message: {
        role: ChatMessageRole.ASSISTANT,
        content:
          "Hello! I'm here to help you fill out this form. What information would you like to provide?",
      },
      parsedFields: {},
    });
  });

  it("should parse field values from user messages", async () => {
    const formSchema = {
      shape: {
        name: {},
        email: {},
      },
    };

    const messages = [
      {
        role: ChatMessageRole.SYSTEM,
        content: "I am a system message",
        timestamp: new Date(),
      },
      {
        role: ChatMessageRole.USER,
        content: "My name is John Doe and my email is john@example.com",
        timestamp: new Date(),
      },
    ];

    const promise = mockLlmApi({ messages, formSchema });
    vi.runAllTimers();
    const response = await promise;

    expect(response.parsedFields).toHaveProperty("name");
    expect(response.parsedFields).toHaveProperty("email");
    expect(response.message.content).toContain(
      "I've captured the following information",
    );
  });

  it("should use field descriptions when provided", async () => {
    const formSchema = {
      shape: {
        name: {},
        email: {},
      },
    };

    const fieldDescriptions = {
      name: "Full Name",
      email: "Email Address",
    };

    const messages = [
      {
        role: ChatMessageRole.USER,
        content: "name: John Doe, email: john@example.com",
        timestamp: new Date(),
      },
    ];

    const promise = mockLlmApi({ messages, formSchema, fieldDescriptions });
    vi.runAllTimers();
    const response = await promise;

    expect(response.message.content).toContain("Full Name");
    expect(response.message.content).toContain("Email Address");
  });

  it("should identify missing fields", async () => {
    const formSchema = {
      shape: {
        name: {},
        email: {},
        phone: {},
      },
    };

    const messages = [
      {
        role: ChatMessageRole.USER,
        content: "name: John Doe",
        timestamp: new Date(),
      },
    ];

    const promise = mockLlmApi({ messages, formSchema });
    vi.runAllTimers();
    const response = await promise;

    expect(response.parsedFields).toHaveProperty("name");
    expect(response.parsedFields).not.toHaveProperty("email");
    expect(response.parsedFields).not.toHaveProperty("phone");
    expect(response.message.content).toContain(
      "I still need the following information",
    );
  });

  it("should handle submit requests", async () => {
    const formSchema = {
      shape: {
        name: {},
      },
    };

    const messages = [
      {
        role: ChatMessageRole.USER,
        content: "Please submit the form",
        timestamp: new Date(),
      },
    ];

    const promise = mockLlmApi({ messages, formSchema });
    vi.runAllTimers();
    const response = await promise;

    expect(response.message.content).toContain("I can't submit the form yet");
    expect(response.message.content).toContain("missing");
  });

  it("should handle submit requests when all fields are filled", async () => {
    const formSchema = {
      shape: {
        name: {},
      },
    };

    const messages = [
      {
        role: ChatMessageRole.USER,
        content: "name: John Doe",
        timestamp: new Date(),
      },
      {
        role: ChatMessageRole.ASSISTANT,
        content: "I've captured your name",
        timestamp: new Date(),
      },
      {
        role: ChatMessageRole.USER,
        content: "Please submit the form",
        timestamp: new Date(),
      },
    ];

    const promise = mockLlmApi({ messages, formSchema });
    vi.runAllTimers();
    const response = await promise;

    expect(response.message.content).toContain("I'm submitting the form now");
  });

  it("should respect the retryDelayMs parameter", async () => {
    const messages = [
      {
        role: ChatMessageRole.USER,
        content: "Hello",
        timestamp: new Date(),
      },
    ];

    const retryDelayMs = 2000;
    const promise = mockLlmApi({ messages, retryDelayMs });

    // Fast-forward time
    vi.advanceTimersByTime(retryDelayMs);

    const response = await promise;
    expect(response).toBeDefined();
  });
});
