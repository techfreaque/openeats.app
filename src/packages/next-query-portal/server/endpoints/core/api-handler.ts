import type { NextResponse } from "next/server";
import { Methods } from "next-query-portal/shared/types/endpoint";

import type { ApiEndpoint } from "../../../client/endpoint";
import type { ResponseType } from "../../../shared/types/response.schema";
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

export function apiHandler<TRequest, TResponse, TUrlVariables, TExampleKey>({
  handler,
  endpoint,
  email,
}: ApiHandlerProps<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey
>): ApiHandlerReturnType<TResponse, TUrlVariables> {
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
    } = await validateRequest<TRequest, TResponse, TUrlVariables, TExampleKey>(
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
    return await createSuccessResponse<
      TRequest,
      TResponse,
      TUrlVariables,
      TExampleKey
    >({
      endpoint,
      data: response.data,
      schema: endpoint.responseSchema,
      onSuccess: (data) =>
        handleEmails<TRequest, TResponse, TUrlVariables>({
          email,
          user,
          responseData: data,
          urlVariables,
          requestData,
        }),
    });
  };
}

async function validateRequest<TRequest, TResponse, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  request: Request,
): Promise<SafeReturnType<TRequest>> {
  if (endpoint.method === Methods.GET) {
    return await validateGetRequest<TRequest>(request, endpoint.requestSchema);
  }
  return await validatePostRequest<TRequest>(request, endpoint.requestSchema);
}

async function safeExecute<TRequest, TResponse, TUrlVariables>(
  handler: ApiHandlerCallBackFunctionType<TRequest, TResponse, TUrlVariables>,
  user: JwtPayloadType,
  validatedData: TRequest,
  urlVariables: TUrlVariables,
): Promise<SafeReturnType<TResponse>> {
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

export type ApiHandlerCallBackFunctionType<TRequest, TResponse, TUrlVariables> =
  ({
    data,
    urlVariables,
    user,
  }: ApiHandlerCallBackProps<TRequest, TUrlVariables>) =>
    | Promise<SafeReturnType<TResponse>>
    | SafeReturnType<TResponse>;

export interface ApiHandlerCallBackProps<TRequest, TUrlVariables> {
  data: TRequest;
  urlVariables: TUrlVariables;
  user: JwtPayloadType;
}

export type SafeReturnType<TResponse> =
  | { data: TResponse; success: true; message?: never; errorCode?: never }
  | { success: false; message: string; errorCode: number; data?: never };

export interface ApiHandlerProps<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey,
> {
  handler: ApiHandlerCallBackFunctionType<TRequest, TResponse, TUrlVariables>;
  email:
    | {
        afterHandlerEmails?: {
          ignoreErrors?: boolean;
          render: EmailFunctionType<TRequest, TResponse, TUrlVariables>;
        }[];
      }
    | undefined;
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>;
}

export type ApiHandlerReturnType<TResponse, TUrlVariables> = (
  request: Request,
  {
    params,
  }: {
    params: Promise<TUrlVariables>;
  },
) => Promise<NextResponse<ResponseType<TResponse>>>;
