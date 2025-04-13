import { NextResponse } from "next/server";
import type { z, ZodSchema } from "zod";
import { ZodError } from "zod";

import type { ApiEndpoint } from "../../../client/endpoint";
import type { UndefinedType } from "../../../shared/types/common.schema";
import {
  errorResponseSchema,
  type ErrorResponseType,
  ErrorResponseTypes,
  type ResponseType,
  type SuccessResponseType,
} from "../../../shared/types/response.schema";
import { debugLogger } from "../../../shared/utils/logger";
import { validateData } from "../../../shared/utils/validation";
import type { ApiHandlerResult } from "./api-handler";

/**
 * Creates a standardized success response for API handlers
 * @param data - Response data
 * @returns API handler result with success status
 */
export function formatResponse<T>(data: T): ApiHandlerResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a standardized success response
 * @param options - Response options
 * @returns Next.js response
 */
export async function createSuccessResponse<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey = string,
>({
  endpoint,
  data,
  schema,
  status = 200,
  onSuccess,
}: {
  /** API endpoint */
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>;

  /** Response data */
  data: TResponse;

  /** Response schema */
  schema: z.ZodSchema<TResponse>;

  /** HTTP status code */
  status?: number;

  /** Success callback */
  onSuccess?: (data: TResponse) => Promise<ApiHandlerResult<UndefinedType>>;
}): Promise<NextResponse<ResponseType<TResponse>>> {
  // Validate response data against schema
  const { message, data: validatedData, success } = validateData(data, schema);

  if (!success) {
    debugLogger(`Response validation error: ${message}`);
    return createErrorResponse<TRequest, TResponse, TUrlVariables, TExampleKey>(
      endpoint,
      `Response validation error: ${message}`,
      400,
    );
  }

  // Execute success callback if provided
  if (onSuccess) {
    try {
      const result = await onSuccess(validatedData);

      if (!result.success) {
        return createErrorResponse<
          TRequest,
          TResponse,
          TUrlVariables,
          TExampleKey
        >(
          endpoint,
          result.message ?? "Unknown error in success callback",
          result.errorCode ?? 500,
        );
      }
    } catch (error) {
      debugLogger(
        `Error in success callback: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return createErrorResponse<
        TRequest,
        TResponse,
        TUrlVariables,
        TExampleKey
      >(
        endpoint,
        `Error in success callback: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
      );
    }
  }

  // Return successful response
  return NextResponse.json(
    { data: validatedData, success: true },
    { status },
  ) as NextResponse<SuccessResponseType<TResponse>>;
}

/**
 * Creates a standardized error response
 * @param endpoint - API endpoint
 * @param message - Error message
 * @param status - HTTP status code
 * @returns Next.js response
 */
export function createErrorResponse<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey = string,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  message: string,
  status = 400,
): NextResponse<ErrorResponseType<TResponse>> {
  // Format the error message with endpoint information
  const formattedMessage = `[${endpoint.path.join("/")}:${endpoint.method}]: ${message}`;

  // Log the error
  debugLogger(`API error response: ${formattedMessage} (${status})`);

  // Validate the error response format
  // Create error response object
  const errorResponse: ErrorResponseType<TResponse> = {
    success: false as const,
    errorType: ErrorResponseTypes.VALIDATION_ERROR,
    message: formattedMessage,
  };

  // Validate error response format
  const validationResult = validateData(errorResponse, errorResponseSchema);

  // Handle validation errors in the error response itself
  if (!validationResult.success) {
    debugLogger(
      `Error response validation failed: ${validationResult.message ?? "Unknown validation error"}`,
    );
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: Invalid error response format",
      } as ErrorResponseType<TResponse>,
      { status: 500 },
    );
  }

  // Return the error response
  return NextResponse.json(errorResponse, { status });
}

/**
 * Validates POST/PUT/PATCH/DELETE request body against a schema
 * @param request - HTTP request
 * @param schema - Zod schema
 * @returns Validated data or error
 */
export async function validatePostRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{
  data: T;
  success: boolean;
  message: string;
}> {
  try {
    // Parse request body as JSON
    const body = await request.json();
    debugLogger("Request body:", body);

    // Validate against schema
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData, message: "Validation successful" };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessage = `Validation error: ${error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ")}`;

      debugLogger(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: {} as T,
      };
    }

    // Handle other errors (like JSON parsing)
    const errorMessage =
      error instanceof Error
        ? `Request parsing error: ${error.message}`
        : "Unknown error validating request";

    debugLogger(errorMessage);
    return {
      success: false,
      message: errorMessage,
      data: {} as T,
    };
  }
}

/**
 * Validates GET request query parameters against a schema
 * @param request - HTTP request
 * @param schema - Zod schema
 * @returns Validated data or error
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function validateGetRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<{
  data: T;
  success: boolean;
  message: string;
}> {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    debugLogger("Query parameters:", params);

    // Use empty object if no parameters provided
    const cleanedParams = (Object.keys(params).length ? params : {}) as T;

    // Validate against schema
    const validationResult = validateData(cleanedParams, schema);

    // Type guard for validation result
    const validation = validationResult as {
      success: boolean;
      message?: string;
      data?: T;
    };

    if (!validation.success) {
      debugLogger(
        `Query parameter validation error: ${validation.message ?? "Unknown validation error"}`,
      );
    }

    if (validation.success) {
      return {
        success: true,
        data: validation.data as T,
        message: "Validation successful"
      };
    } else {
      return {
        success: false,
        message: validation.message || "Validation failed",
        data: {} as T
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `Query parameter error: ${error.message}`
        : "Unknown error processing query parameters";

    debugLogger(errorMessage);
    return {
      success: false,
      message: errorMessage,
      data: {} as T,
    };
  }
}
