import type { NextResponse } from "next/server";

import type { ResponseType } from "../../../shared/types/response.schema";
import { validateData } from "../../../shared/utils/validation";
import type { JwtPayloadType } from "../auth/jwt";
import { getVerifiedUser } from "../auth/user";
import {
  createErrorResponse,
  createSuccessResponse,
  validateGetRequest,
  validatePostRequest,
} from "./api-response";
import type { ApiEndpoint } from "./endpoint";

export type ApiHandlerCallBack<TRequest, TResponse, TUrlVariables> = ({
  data,
  urlVariables,
  user,
}: ApiHandlerCallBackProps<TRequest, TUrlVariables>) => Promise<
  SafeReturnType<TResponse>
>;

export type ApiHandlerCallBackProps<TRequest, TUrlVariables> = {
  data: TRequest;
  urlVariables: TUrlVariables;
  user: JwtPayloadType;
};

export type SafeReturnType<TResponse> =
  | { data: TResponse; success: true; message?: never; errorCode?: never }
  | { success: false; message: string; errorCode: number; data?: TResponse };

export interface ApiHandlerProps<TRequest, TResponse, TUrlVariables> {
  handler: ApiHandlerCallBack<TRequest, TResponse, TUrlVariables>;
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>;
}

export function apiHandler<TRequest, TResponse, TUrlVariables>({
  handler,
  endpoint,
}: ApiHandlerProps<TRequest, TResponse, TUrlVariables>): (
  request: Request,
  { params }: { params: Promise<TUrlVariables> },
) => Promise<NextResponse<ResponseType<TResponse>>> {
  return async (
    request: Request,
    { params }: { params: Promise<TUrlVariables> },
  ) => {
    const user = await getVerifiedUser(endpoint.allowedRoles);
    if (!user) {
      return createErrorResponse(endpoint, "Not signed in", 401);
    }
    const {
      data: urlVariables,
      message: urlSchemaError,
      success: urlSchemaSuccess,
    } = validateData(await params, endpoint.requestUrlSchema);
    if (!urlSchemaSuccess) {
      return createErrorResponse(endpoint, urlSchemaError, 400);
    }
    const {
      data: requestData,
      success: requestDataSuccess,
      message: requestDataMessage,
    } = await validateRequest<TRequest, TResponse, TUrlVariables>(
      endpoint,
      request,
    );
    if (!requestDataSuccess) {
      return createErrorResponse(endpoint, requestDataMessage, 400);
    }
    const response = await safeExecute<TRequest, TResponse, TUrlVariables>(
      handler,
      user,
      requestData,
      urlVariables,
    );
    if (!response.success) {
      return createErrorResponse(endpoint, response.message, 500);
    }
    return createSuccessResponse<TRequest, TResponse, TUrlVariables>(
      endpoint,
      response.data,
      endpoint.responseSchema,
    );
  };
}

async function validateRequest<TRequest, TResponse, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  request: Request,
): Promise<SafeReturnType<TRequest>> {
  if (endpoint.method === "GET") {
    return validateGetRequest<TRequest>(request, endpoint.requestSchema);
  }
  return validatePostRequest<TRequest>(request, endpoint.requestSchema);
}

async function safeExecute<TRequest, TResponse, TUrlVariables>(
  handler: ApiHandlerCallBack<TRequest, TResponse, TUrlVariables>,
  user: JwtPayloadType,
  validatedData: TRequest,
  urlVariables: TUrlVariables,
): Promise<SafeReturnType<TResponse>> {
  try {
    return handler({
      data: validatedData,
      urlVariables,
      user,
    });
  } catch (err) {
    const error = err as Error;
    return { success: false, message: error.message, errorCode: 500 };
  }
}
