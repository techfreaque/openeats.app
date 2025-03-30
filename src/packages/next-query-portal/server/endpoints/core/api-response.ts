import { NextResponse } from "next/server";
import type { z, ZodSchema } from "zod";
import { ZodError } from "zod";

import type { ApiEndpoint } from "../../../client/endpoint";
import type { UndefinedType } from "../../../shared/types/common.schema";
import {
  errorResponseSchema,
  type ErrorResponseType,
  type ResponseType,
  type SuccessResponseType,
} from "../../../shared/types/response.schema";
import { validateData } from "../../../shared/utils/validation";
import type { SafeReturnType } from "./api-handler";

/**
 * Creates a standardized success response
 */
export async function createSuccessResponse<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey,
>({
  endpoint,
  data,
  schema,
  status = 200,
  onSuccess,
}: {
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>;
  data: TResponse;
  schema: z.ZodSchema<TResponse>;
  status?: number;
  onSuccess?: (data: TResponse) => Promise<SafeReturnType<UndefinedType>>;
}): Promise<NextResponse<ResponseType<TResponse>>> {
  const { message, data: validatedData, success } = validateData(data, schema);
  if (!success) {
    return createErrorResponse<TRequest, TResponse, TUrlVariables, TExampleKey>(
      endpoint,
      message,
      400,
    );
  }
  const result = await onSuccess?.(validatedData);
  if (!result?.success) {
    return createErrorResponse<TRequest, TResponse, TUrlVariables, TExampleKey>(
      endpoint,
      result?.message ?? "Unknown error",
      result?.errorCode ?? 500,
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
export function createErrorResponse<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey,
>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  message: string,
  status = 400,
): NextResponse<ErrorResponseType> {
  const {
    message: validationError,
    data,
    success,
  } = validateData(
    {
      success: false,
      message,
    },
    errorResponseSchema,
  );

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        message: validationError,
      } as ErrorResponseType,
      { status: 500 },
    );
  }
  data.message = `[${endpoint.path.join("/")}:${endpoint.method}]: ${message}`;
  return NextResponse.json(
    {
      success: false,
      message: data.message,
    } as ErrorResponseType,
    {
      status,
    },
  );
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
  const params = Object.fromEntries(searchParams.entries());
  const cleanedParams = (Object.keys(params).length ? params : undefined) as T;
  return validateData(cleanedParams, schema);
}
