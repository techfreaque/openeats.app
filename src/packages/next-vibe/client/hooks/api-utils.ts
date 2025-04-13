import { Methods } from "next-vibe/shared/types/endpoint";
import { validateData } from "next-vibe/shared/utils/validation";

import type {
  ErrorResponseType,
  ResponseType,
  SuccessResponseType,
} from "../../shared/types/response.schema";
import type { ApiEndpoint } from "../endpoint";
import { getAuthToken } from "../storage/auth-client";

// Type guard functions
function isSuccessResponse<T>(
  response: unknown,
): response is SuccessResponseType<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: boolean }).success === true &&
    "data" in response
  );
}

function isErrorResponse<TData>(response: unknown): response is ErrorResponseType<TData> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: boolean }).success === false &&
    "message" in response &&
    typeof (response as { message: string }).message === "string"
  );
}

/**
 * Core function to call an API endpoint
 * Handles request validation, authentication, and response parsing
 */
export async function callApi<TRequest, TResponse, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  endpointUrl: string,
  postBody: string | undefined,
): Promise<ResponseType<TResponse>> {
  try {
    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authentication header if required
    if (endpoint.requiresAuthentication()) {
      const token = await getAuthToken();
      if (!token) {
        return {
          success: false,
          message: "Authentication required but no token available",
          errorType: "AUTH_ERROR",
        } as ErrorResponseType<TResponse>;
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Prepare request options
    const options: RequestInit = {
      method: endpoint.method,
      headers,
      credentials: "include", // Include cookies for session-based auth
    };

    // Add request body for non-GET requests
    if (endpoint.method !== Methods.GET && postBody) {
      options.body = postBody;
    }

    // Make the API call
    const response = await fetch(endpointUrl, options);
    const json = (await response.json()) as ResponseType<TResponse>;

    // Handle API response
    if (!response.ok) {
      const errorMessage = isErrorResponse<TResponse>(json)
        ? json.message
        : `API error: ${response.status} ${response.statusText}`;
      return {
        success: false,
        message: errorMessage,
        errorType: "HTTP_ERROR",
        errorCode: response.status,
      } as ErrorResponseType<TResponse>;
    }

    // Validate successful response against schema
    if (isSuccessResponse<unknown>(json)) {
      const validationResponse = validateData(
        json.data,
        endpoint.responseSchema,
      );
      if (!validationResponse.success) {
        return {
          success: false,
          message: `Response validation error: ${validationResponse.message}`,
          errorType: "VALIDATION_ERROR",
        } as ErrorResponseType<TResponse>;
      }
      return {
        success: true,
        data: validationResponse.data,
      };
    } else {
      const errorMessage = isErrorResponse<TResponse>(json)
        ? json.message
        : "Unknown error";
      return {
        success: false,
        message: errorMessage,
        errorType: "INTERNAL_ERROR",
      } as ErrorResponseType<TResponse>;
    }
  } catch (error) {
    return {
      success: false,
      message: `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      errorType: "INTERNAL_ERROR",
    } as ErrorResponseType<TResponse>;
  }
}
