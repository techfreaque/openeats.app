import type { ApiEndpoint } from "../../server/endpoints/core/endpoint";
import type {
  ErrorResponseType,
  ResponseType,
  SuccessResponseType,
} from "../../shared/types/response.schema";
import { getAuthToken } from "../auth/auth-client";

// Type guard functions
function isSuccessResponse<T>(
  response: unknown,
): response is SuccessResponseType<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: unknown }).success === true &&
    "data" in response
  );
}

function isErrorResponse(response: unknown): response is ErrorResponseType {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    (response as { success: unknown }).success === false &&
    "message" in response &&
    typeof (response as { message: unknown }).message === "string"
  );
}

/**
 * Core function to call an API endpoint
 * Handles request validation, authentication, and response parsing
 */
export async function callApi<TRequest, TResponse, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
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
        };
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
    if (endpoint.method !== "GET" && postBody) {
      options.body = postBody;
    }

    // Make the API call
    const response = await fetch(endpointUrl, options);
    const json = (await response.json()) as ResponseType<TResponse>;

    // Handle API response
    if (!response.ok) {
      const errorMessage = isErrorResponse(json)
        ? json.message
        : `API error: ${response.status} ${response.statusText}`;
      return {
        success: false,
        message: errorMessage,
      };
    }

    // Validate successful response against schema
    if (isSuccessResponse<unknown>(json)) {
      try {
        const validatedData = endpoint.responseSchema.parse(json.data);
        return {
          success: true,
          data: validatedData,
        } as SuccessResponseType<TResponse>;
      } catch (error) {
        return {
          success: false,
          message: `Response validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    } else {
      const errorMessage = isErrorResponse(json)
        ? json.message
        : "Unknown error";
      return {
        success: false,
        message: errorMessage,
      } as ErrorResponseType;
    }
  } catch (error) {
    return {
      success: false,
      message: `API request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
