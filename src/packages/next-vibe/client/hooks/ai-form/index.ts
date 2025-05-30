"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldPathValue, Path, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";

import { llmApiEndpoint } from "../../../shared/endpoints/ai-chat";
import { parseError } from "../../../shared/utils/parse-error";
import type { ApiEndpoint } from "../../endpoint";
import type { ApiStore, MutationStoreType } from "../store";
import { useApiStore } from "../store";
import type {
  ApiFormOptions,
  ApiMutationOptions,
  SubmitFormFunction,
} from "../types";
import type {
  AiFormOptions,
  AiFormReturn,
  ChatMessage,
  ChatMessageContent,
  FieldParsingResult,
} from "./types";
import { ChatMessageRole, FieldParsingStatus } from "./types";

/**
 * Creates a form with AI assistance for filling out fields
 * Extends the standard form hook with chat capabilities
 */
export function useAiForm<
  TRequest extends Record<string, unknown>,
  TResponse,
  TUrlVariables,
  TExampleKey,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  options: AiFormOptions<TRequest> = {},
  mutationOptions: ApiMutationOptions<TRequest, TResponse, TUrlVariables> = {},
): AiFormReturn<TRequest, TResponse, TUrlVariables> {
  // Extract AI-specific options with defaults
  const {
    systemPrompt = "I'm an AI assistant that will help you fill out this form. I'll ask you questions about the required information and help you complete the form step by step.",
    autoStart = false,
    includeFieldDescriptions = true,
    fieldParsers,
    ...formOptions
  } = options;

  // Get Zustand store methods
  const { executeMutation, getMutationId, getFormId } = useApiStore();
  const formId = getFormId(endpoint);
  const mutationId = getMutationId(endpoint);

  // Create memoized selectors to prevent re-renders
  const mutationSelector = useMemo(
    () =>
      (state: ApiStore): MutationStoreType<TResponse> | undefined => {
        const mutation = state.mutations[mutationId];
        return mutation
          ? (mutation as MutationStoreType<TResponse>)
          : undefined;
      },
    [mutationId],
  );

  interface FormStateType {
    formError: Error | null;
    isSubmitting: boolean;
  }

  const formSelector = useMemo(
    () =>
      (state: ApiStore): FormStateType | undefined => {
        const form = state.forms[formId];
        return form ? (form as FormStateType) : undefined;
      },
    [formId],
  );

  // Extract state from the Zustand store with shallow comparison
  const mutationState = useApiStore(mutationSelector) ?? {
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    data: undefined,
  };

  const formState = useApiStore(formSelector) ?? {
    formError: null,
    isSubmitting: false,
  };

  // Extract store methods for error handling
  const setFormErrorStore = useApiStore((state) => state.setFormError);
  const clearFormErrorStore = useApiStore((state) => state.clearFormError);

  const formConfig: ApiFormOptions<TRequest> = {
    ...formOptions,
    resolver: zodResolver(endpoint.requestSchema),
  };

  // Initialize form with the proper configuration
  const formMethods = useForm<TRequest>(formConfig);

  // Error management functions
  const clearFormError = useCallback(
    () => clearFormErrorStore(formId),
    [clearFormErrorStore, formId],
  );

  const setError = useCallback(
    (error: Error | null) => setFormErrorStore(formId, error),
    [setFormErrorStore, formId],
  );

  // AI-specific state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: ChatMessageRole.SYSTEM,
      content: systemPrompt,
      timestamp: Date.now(),
    },
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [fieldParsingResults, setFieldParsingResults] = useState<
    Record<string, FieldParsingResult>
  >({});

  // Extract field descriptions from the endpoint if available
  const fieldDescriptions = useMemo(() => {
    if (!includeFieldDescriptions) {
      return undefined;
    }
    return endpoint.fieldDescriptions ?? undefined;
  }, [endpoint.fieldDescriptions, includeFieldDescriptions]);

  // Function to send a user message and get AI response
  const sendUserMessage = useCallback(
    async (message: ChatMessageContent): Promise<void> => {
      // Add user message to chat
      const userMessage: ChatMessage = {
        role: ChatMessageRole.USER,
        content: message,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, userMessage]);
      setIsAiProcessing(true);

      try {
        const updatedMessages = [...chatMessages, userMessage];

        const apiMessages = updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const formValues = formMethods.getValues();
        const formSchemaObj = Object.keys(formValues).reduce(
          (acc, key) => {
            acc[key] = "string";
            return acc;
          },
          {} as Record<string, string>,
        );

        const requestData = {
          messages: apiMessages,
          formSchema: formSchemaObj,
          fieldDescriptions,
        };

        const { success, endpointUrl, postBody } =
          llmApiEndpoint.POST.getRequestData({
            requestData,
          });

        if (!success) {
          throw new Error("Failed to prepare request data");
        }

        const response = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: postBody,
        } as RequestInit);

        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }

        const responseData = (await response.json()) as {
          message?: {
            content?: string;
          };
          parsedFields?: Record<string, unknown>;
        };

        // Add assistant message to chat
        const assistantMessage: ChatMessage = {
          role: ChatMessageRole.ASSISTANT,
          content: (function (): string {
            // Type guard for responseData
            if (responseData?.message?.content !== undefined) {
              return String(responseData.message.content);
            }
            return "Response received";
          })(),
          timestamp: Date.now(),
        };

        // Type guard for parsedFields
        if (
          typeof responseData === "object" &&
          responseData !== null &&
          "parsedFields" in responseData &&
          responseData.parsedFields !== null
        ) {
          // Safe to access parsedFields after type guard
          const typedParsedFields = responseData.parsedFields;
          assistantMessage.metadata = {
            parsedFields: typedParsedFields,
          };
        }

        setChatMessages((prev) => [...prev, assistantMessage]);

        // Update form fields with parsed values
        if (
          typeof responseData === "object" &&
          responseData !== null &&
          "parsedFields" in responseData &&
          responseData.parsedFields !== null &&
          typeof responseData.parsedFields === "object"
        ) {
          const newParsingResults: Record<string, FieldParsingResult> = {};

          const parsedFields = responseData.parsedFields;

          for (const [field, value] of Object.entries(parsedFields)) {
            try {
              // Use custom field parser if available
              const parsedValue = fieldParsers?.[field]
                ? fieldParsers[field](String(value))
                : value;

              // Validate the field value using the form's validation
              formMethods.setValue(
                field as Path<TRequest>,
                parsedValue as FieldPathValue<TRequest, Path<TRequest>>,
              );
              const fieldError = formMethods.getFieldState(
                field as Path<TRequest>,
              ).error;

              // Create field parsing result
              newParsingResults[field] = {
                fieldName: field,
                status: fieldError
                  ? FieldParsingStatus.ERROR
                  : FieldParsingStatus.SUCCESS,
                value:
                  typeof parsedValue === "object" && parsedValue !== null
                    ? JSON.stringify(parsedValue)
                    : (parsedValue as string | number | boolean | null),
                ...(fieldError && { error: fieldError.message }),
                retryCount:
                  (fieldParsingResults[field]?.retryCount ?? 0) +
                  (fieldError ? 1 : 0),
              };
            } catch (error) {
              newParsingResults[field] = {
                fieldName: field,
                status: FieldParsingStatus.ERROR,
                value:
                  typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value),
                error: error instanceof Error ? error.message : String(error),
                retryCount: (fieldParsingResults[field]?.retryCount ?? 0) + 1,
              };
            }
          }

          setFieldParsingResults((prev) => ({
            ...prev,
            ...newParsingResults,
          }));
        }
      } catch (error) {
        // Handle API error
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Add error message to chat
        const errorAssistantMessage: ChatMessage = {
          role: ChatMessageRole.ASSISTANT,
          content: `Sorry, I encountered an error: ${errorMessage}`,
          timestamp: Date.now(),
        };

        setChatMessages((prev) => [...prev, errorAssistantMessage]);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setIsAiProcessing(false);
      }
    },
    [
      chatMessages,
      fieldDescriptions,
      fieldParsers,
      fieldParsingResults,
      formMethods,
      setError,
    ],
  );

  // Function to start the AI form filling process
  const startAiFormFilling = useCallback(async (): Promise<void> => {
    // Clear any previous errors
    clearFormError();

    // Reset field parsing results
    setFieldParsingResults({});

    // Generate initial prompt based on form schema
    let initialPrompt =
      "I need to fill out a form with the following fields:\n\n";

    // Extract field information from the schema
    const fieldNames = Object.keys(formMethods.getValues());

    for (const field of fieldNames) {
      const description = fieldDescriptions?.[field] ?? field;
      initialPrompt += `- ${description}\n`;
    }

    initialPrompt += "\nCan you help me fill this out step by step?";

    // Send the initial prompt
    await sendUserMessage(initialPrompt);
  }, [clearFormError, fieldDescriptions, formMethods, sendUserMessage]);

  // Function to reset the chat
  const resetChat = useCallback((): void => {
    setChatMessages([
      {
        role: ChatMessageRole.SYSTEM,
        content: systemPrompt,
        timestamp: Date.now(),
      },
    ]);
    setFieldParsingResults({});
  }, [systemPrompt]);

  // Auto-start AI form filling if enabled
  useEffect(() => {
    if (autoStart) {
      void startAiFormFilling();
    }
  }, [autoStart, startAiFormFilling]);

  // Create a submit handler that validates and submits the form
  const submitForm: SubmitFormFunction<TRequest, TResponse, TUrlVariables> =
    useCallback(
      (event, options): void => {
        const _submitForm = async (): Promise<void> => {
          try {
            // Get form data
            const formData = formMethods.getValues();

            // Clear any previous errors
            clearFormError();

            // Call the API with the form data
            const result = await executeMutation(
              endpoint,
              formData,
              options.urlParamVariables,
              mutationOptions,
            );

            if (result === undefined) {
              return;
            }

            options.onSuccess?.({
              responseData: result,
              pathParams: options.urlParamVariables,
              requestData: formData,
            });

            // Add success message to chat if we have chat messages
            if (chatMessages.length > 1) {
              const successMessage: ChatMessage = {
                role: ChatMessageRole.ASSISTANT,
                content: "Great! The form has been submitted successfully.",
                timestamp: Date.now(),
              };

              setChatMessages((prev) => [...prev, successMessage]);
            }
          } catch (error) {
            // Handle any errors that occur during submission
            const parsedError = parseError(error);
            setError(parsedError);
            options.onError?.(parsedError);

            // Add error message to chat if we have chat messages
            if (chatMessages.length > 1) {
              const errorMessage: ChatMessage = {
                role: ChatMessageRole.ASSISTANT,
                content: `Sorry, there was an error submitting the form: ${parsedError.message}`,
                timestamp: Date.now(),
              };

              setChatMessages((prev) => [...prev, errorMessage]);
            }
          }
        };

        void formMethods.handleSubmit(_submitForm, (errors) =>
          options.onError?.(parseError(errors)),
        )(event);
      },
      [
        chatMessages.length,
        clearFormError,
        endpoint,
        executeMutation,
        formMethods,
        mutationOptions,
        setChatMessages,
        setError,
      ],
    );

  // Function to submit the form via chat
  const submitViaChat = useCallback(async (): Promise<void> => {
    const currentChatLength = chatMessages.length;

    // Add user message indicating submission intent
    const userMessage: ChatMessage = {
      role: ChatMessageRole.USER,
      content: "Submit the form",
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMessage]);

    // Validate the form
    const isValid = await formMethods.trigger();

    if (!isValid) {
      // Get validation errors
      const errors = formMethods.formState.errors;
      let errorMessage = "There are some validation errors in the form:\n\n";

      for (const [field, error] of Object.entries(errors)) {
        const description = fieldDescriptions?.[field] ?? field;
        errorMessage += `- ${description}: ${error?.message ?? "Invalid value"}\n`;
      }

      // Add error message to chat
      const validationErrorMessage: ChatMessage = {
        role: ChatMessageRole.ASSISTANT,
        content: errorMessage,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, validationErrorMessage]);
      return;
    }

    // Submit the form
    submitForm(undefined, {
      urlParamVariables: {} as TUrlVariables,
      onSuccess: (_data) => {
        // Add success message to chat
        const successMessage: ChatMessage = {
          role: ChatMessageRole.ASSISTANT,
          content: "Great! The form has been submitted successfully.",
          timestamp: Date.now(),
        };

        setChatMessages((prev) => [...prev, successMessage]);
      },
      onError: (error) => {
        if (currentChatLength > 1) {
          const errorMessage: ChatMessage = {
            role: ChatMessageRole.ASSISTANT,
            content: `Sorry, there was an error submitting the form: ${error.message}`,
            timestamp: Date.now(),
          };

          setChatMessages((prev) => [...prev, errorMessage]);
        }
      },
    });
  }, [
    chatMessages.length,
    fieldDescriptions,
    formMethods,
    setChatMessages,
    submitForm,
  ]);

  // Function to get a summary of the current form state
  const getFormSummary = useCallback((): string => {
    const formValues = formMethods.getValues();
    const formErrors = formMethods.formState.errors;

    let summary = "Current form state:\n\n";

    // Add form values
    for (const [field, value] of Object.entries(formValues)) {
      const description = fieldDescriptions?.[field] ?? field;
      const fieldError = formErrors[field];

      if (value !== undefined && value !== "") {
        let valueStr = "";
        if (typeof value === "object" && value !== null) {
          try {
            valueStr = JSON.stringify(value);
          } catch {
            // Catch error when trying to stringify circular references
            valueStr = "[Complex Object]";
          }
        } else {
          // Explicitly handle different primitive types
          valueStr =
            value === null
              ? "null"
              : value === undefined
                ? "undefined"
                : typeof value === "string"
                  ? value
                  : typeof value === "number" || typeof value === "boolean"
                    ? String(value)
                    : "[Unknown Type]";
        }

        summary += `- ${description}: ${valueStr}`;
        if (fieldError) {
          summary += ` (Error: ${fieldError.message})`;
        }
        summary += "\n";
      }
    }

    return summary;
  }, [fieldDescriptions, formMethods]);

  // Function to get missing fields
  const getMissingFields = useCallback((): string[] => {
    const formValues = formMethods.getValues();
    const fieldNames = Object.keys(formValues);

    return fieldNames.filter((field) => {
      const value = formValues[field as keyof TRequest];
      return value === undefined || value === "" || value === null;
    });
  }, [formMethods]);

  return {
    form: formMethods as UseFormReturn<TRequest>,
    submitForm,
    isSubmitting: mutationState.isPending,
    isSubmitSuccessful: mutationState.isSuccess,
    submitError: mutationState.error ?? formState.formError ?? undefined,
    errorMessage:
      mutationState.error?.message ?? formState.formError?.message ?? undefined,

    // AI-specific properties
    chatMessages,
    sendUserMessage,
    startAiFormFilling,
    resetChat,
    isAiProcessing,
    fieldParsingResults,
    submitViaChat,
    getFormSummary,
    getMissingFields,
  };
}
