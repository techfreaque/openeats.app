import type { NextResponse } from "next/server";
import { Methods } from "next-vibe/shared/types/endpoint";

import type { ApiEndpoint } from "../../../client/endpoint";
import type { ResponseType } from "../../../shared/types/response.schema";
import { debugLogger } from "../../../shared/utils/logger";
import { validateData } from "../../../shared/utils/validation";
import {
  type EmailFunctionType,
  handleEmails,
} from "../../email/handle-emails";
import type { JwtPayloadType } from "../auth/jwt";
import { getVerifiedUser } from "../auth/user";
import {
  createErrorResponse,
  createSuccessResponse,
  validateGetRequest,
  validatePostRequest,
} from "./api-response";

/**
 * Create an API route handler
 * @param options - API handler options
 * @returns Next.js route handler
 */
export function apiHandler<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey = string,
>(
  options: ApiHandlerOptions<TRequest, TResponse, TUrlVariables, TExampleKey>,
): ApiHandlerReturnType<TResponse, TUrlVariables> {
  const { endpoint, handler, email } = options;

  return async (
    request: Request,
    { params }: { params: Promise<TUrlVariables> },
  ) => {
    try {
      debugLogger(`API request: ${endpoint.method} ${endpoint.path.join("/")}`);

      // Authenticate user
      const user = await getVerifiedUser(endpoint.allowedRoles);
      if (!user) {
        return createErrorResponse(endpoint, "Authentication required", 401);
      }

      // Validate URL parameters
      const {
        data: urlVariables,
        message: urlSchemaError,
        success: urlSchemaSuccess,
      } = validateData(await params, endpoint.requestUrlSchema);

      if (!urlSchemaSuccess) {
        return createErrorResponse(
          endpoint,
          `URL validation error: ${urlSchemaError}`,
          400,
        );
      }

      // Parse and validate request data
      const {
        data: requestData,
        success: requestDataSuccess,
        message: requestDataMessage,
      } = await validateRequest<
        TRequest,
        TResponse,
        TUrlVariables,
        TExampleKey
      >(endpoint, request);

      if (!requestDataSuccess) {
        return createErrorResponse(
          endpoint,
          `Request validation error: ${requestDataMessage}`,
          400,
        );
      }

      // Execute the handler
      const result = await safeExecute<TRequest, TResponse, TUrlVariables>(
        handler,
        user,
        requestData,
        urlVariables,
      );

      if (!result.success) {
        return createErrorResponse(
          endpoint,
          result.message,
          result.errorCode || 500,
        );
      }

      // Create success response with email handling
      return await createSuccessResponse<
        TRequest,
        TResponse,
        TUrlVariables,
        TExampleKey
      >({
        endpoint,
        data: result.data,
        schema: endpoint.responseSchema,
        status: result.status ?? 200,
        onSuccess: (data) =>
          handleEmails<TRequest, TResponse, TUrlVariables>({
            email,
            user,
            responseData: data,
            urlVariables,
            requestData,
          }),
      });
    } catch (error) {
      // Handle unexpected errors
      debugLogger(
        `API error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return createErrorResponse(
        endpoint,
        `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
        500,
      );
    }
  };
}

/**
 * Validate request data based on HTTP method
 * @param endpoint - API endpoint
 * @param request - HTTP request
 * @returns Validated request data or error
 */
async function validateRequest<TRequest, TResponse, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  request: Request,
): Promise<{
  data: TRequest;
  success: boolean;
  message: string;
}> {
  if (endpoint.method === Methods.GET) {
    return await validateGetRequest<TRequest>(request, endpoint.requestSchema);
  }
  return await validatePostRequest<TRequest>(request, endpoint.requestSchema);
}

/**
 * Safely execute the handler function with error handling
 * @param handler - API handler function
 * @param user - Authenticated user
 * @param validatedData - Validated request data
 * @param urlVariables - Validated URL parameters
 * @returns Handler result or error
 */
async function safeExecute<TRequest, TResponse, TUrlVariables>(
  handler: ApiHandlerFunction<TRequest, TResponse, TUrlVariables>,
  user: JwtPayloadType,
  validatedData: TRequest,
  urlVariables: TUrlVariables,
): Promise<ApiHandlerResult<TResponse>> {
  try {
    return await handler({
      data: validatedData,
      urlVariables,
      user,
    });
  } catch (err) {
    const error = err as Error;
    return { success: false, message: error.message, errorCode: 500 };
  }
}

/**
 * API handler result type
 */
export type ApiHandlerResult<T> =
  | { success: true; data: T; status?: number }
  | { success: false; message: string; errorCode: number };

/**
 * API handler props
 */
export interface ApiHandlerProps<TRequest, TUrlVariables> {
  /** Request data */
  data: TRequest;

  /** URL variables */
  urlVariables: TUrlVariables;

  /** Authenticated user */
  user: JwtPayloadType;
}

/**
 * API handler function type
 */
export type ApiHandlerFunction<TRequest, TResponse, TUrlVariables> = (
  props: ApiHandlerProps<TRequest, TUrlVariables>,
) => Promise<ApiHandlerResult<TResponse>> | ApiHandlerResult<TResponse>;

/**
 * Email handler configuration
 */
export interface EmailHandler<TRequest, TResponse, TUrlVariables> {
  /** Email rendering function */
  render: EmailFunctionType<TRequest, TResponse, TUrlVariables>;

  /** Whether to ignore errors during email sending */
  ignoreErrors?: boolean;
}

/**
 * API handler options
 */
export interface ApiHandlerOptions<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey = string,
> {
  /** API endpoint definition */
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>;

  /** Handler function */
  handler: ApiHandlerFunction<TRequest, TResponse, TUrlVariables>;

  /** Email handlers (optional) */
  email?:
    | {
        afterHandlerEmails?: EmailHandler<TRequest, TResponse, TUrlVariables>[];
      }
    | undefined;
}

/**
 * API handler return type
 */
export type ApiHandlerReturnType<TResponse, TUrlVariables> = (
  request: Request,
  { params }: { params: Promise<TUrlVariables> },
) => Promise<NextResponse<ResponseType<TResponse>>>;
