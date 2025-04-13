"use client";

import type { FieldValues } from "react-hook-form";

import type { ApiFormOptions, ApiFormReturn } from "../types";

/**
 * Chat message types
 */
export enum ChatMessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

/**
 * Chat message content type
 */
export type ChatMessageContent = string;

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: ChatMessageRole;
  content: ChatMessageContent;
  timestamp: number; // Using number instead of Date for better serialization
  metadata?: Record<
    string,
    string | number | boolean | null | Record<string, unknown>
  >; // For additional data like parsed fields, etc.
}

/**
 * Form field parsing status
 */
export enum FieldParsingStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

/**
 * Form field parsing result
 */
export interface FieldParsingResult {
  fieldName: string;
  status: FieldParsingStatus;
  value: string | number | boolean | null; // More specific type than unknown
  error?: string;
  retryCount?: number;
}

/**
 * AI form options extending the standard form options
 */
export interface AiFormOptions<TRequest extends FieldValues>
  extends ApiFormOptions<TRequest> {
  /**
   * Initial system prompt for the AI
   */
  systemPrompt?: string;

  /**
   * Whether to automatically start the AI form filling process
   * @default false
   */
  autoStart?: boolean;

  /**
   * Maximum number of retries for field parsing
   * @default 3
   */
  maxRetries?: number;

  /**
   * Whether to show field descriptions in the AI prompts
   * @default true
   */
  includeFieldDescriptions?: boolean;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelayMs?: number;

  /**
   * Custom field parsers for specific field types
   */
  fieldParsers?: Record<
    string,
    (value: string) => string | number | boolean | null
  >;
}

/**
 * AI form return type extending the standard form return
 */
export interface AiFormReturn<
  TRequest extends FieldValues,
  TResponse,
  TUrlVariables,
> extends ApiFormReturn<TRequest, TResponse, TUrlVariables> {
  /**
   * Chat messages
   */
  chatMessages: ChatMessage[];

  /**
   * Add a user message to the chat
   */
  sendUserMessage: (message: ChatMessageContent) => Promise<void>;

  /**
   * Start the AI form filling process
   */
  startAiFormFilling: () => Promise<void>;

  /**
   * Reset the chat
   */
  resetChat: () => void;

  /**
   * Whether the AI is currently processing
   */
  isAiProcessing: boolean;

  /**
   * Field parsing results
   */
  fieldParsingResults: Record<string, FieldParsingResult>;

  /**
   * Submit the form via chat
   */
  submitViaChat: () => Promise<void>;

  /**
   * Get a summary of the current form state
   */
  getFormSummary: () => string;

  /**
   * Get missing fields that still need to be filled
   */
  getMissingFields: () => string[];
}
