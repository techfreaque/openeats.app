import { NextResponse } from "next/server";
import type { z, ZodSchema } from "zod";
import { ZodError } from "zod";

import {
  errorResponseSchema,
  type ErrorResponseType,
  type ResponseType,
  type SuccessResponseType,
} from "../../../shared/types/response.schema";
import { validateData } from "../../../shared/utils/validation";
import type { SafeReturnType } from "./api-handler";
import type { ApiEndpoint } from "./endpoint";

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<TRequest, TResponse, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  data: TResponse,
  schema: z.ZodSchema<TResponse>,
  status: number = 200,
): NextResponse<ResponseType<TResponse>> {
  const {
    message,
    data: validatedData,
    success,
  } = validateData<TResponse>(data, schema);
  if (!success) {
    return createErrorResponse<TRequest, TResponse, TUrlVariables>(
      endpoint,
      message,
      400,
    );
  }
  return NextResponse.json(
    { data: validatedData, success: true },
    { status },
  ) as NextResponse<SuccessResponseType<TResponse>>;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse<TRequest, TResponse, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  message: string,
  status: number = 400,
): NextResponse<ErrorResponseType> {
  const {
    message: validationError,
    data,
    success,
  } = validateData<ErrorResponseType>(
    {
      success: false,
      message,
    },
    errorResponseSchema as z.ZodSchema<ErrorResponseType>,
  );

  if (!success) {
    return NextResponse.json(
      { success: false, message: validationError } as ErrorResponseType,
      { status: 500 },
    );
  }
  data.message = `[${endpoint.path.join("/")}:${endpoint.method}]: ${message}`;
  return NextResponse.json(data, {
    status,
  });
}

/**
 * Validates request body against a schema
 */
export async function validatePostRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<SafeReturnType<T>> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      // Create a validation error with formatted message
      const validationError = new Error(
        `Validation error: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
      );
      return {
        success: false,
        message: validationError.message,
        errorCode: 400,
      };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error validating request",
      errorCode: 400,
    };
  }
}

/**
 * Validates request body against a schema
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function validateGetRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<SafeReturnType<T>> {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries()) as T;
  return validateData<T>(
    Object.keys(params).length ? params : undefined,
    schema,
  );
}
