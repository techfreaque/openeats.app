import type { ApiEndpoint } from "next-vibe/client/endpoint";
import { db } from "next-vibe/server/db";
import type { JwtPayloadType } from "next-vibe/server/endpoints/auth/jwt";
import { env } from "next-vibe/server/env";
import {
  ErrorResponseTypes,
  type ResponseType,
} from "next-vibe/shared/types/response.schema";
import request from "supertest";

import { createSessionAndGetUser } from "@/app/api/v1/auth/public/login/route-handler";

/**
 * Call the api on the test server
 */

export async function sendTestRequest<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey,
>({
  endpoint,
  data,
  urlParams,
  user,
}: {
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>;
  data: TRequest;
  urlParams: TUrlVariables;
  user: JwtPayloadType | undefined;
}): Promise<
  ResponseType<TResponse> & {
    status: number;
  }
> {
  try {
    const searchParams = new URLSearchParams();
    if (urlParams) {
      for (const [key, value] of Object.entries(urlParams)) {
        searchParams.append(key, String(value));
      }
    }
    const url = `/${endpoint.path.join("/")}?${searchParams.toString()}`;
    let token: string | undefined = undefined;
    if (user) {
      const userData = await createSessionAndGetUser(user.id, false);
      if (!userData.success) {
        return {
          success: false,
          message: `Not able to create session for user ${user.id}, error message: ${userData.message}`,
          errorType: ErrorResponseTypes.INTERNAL_ERROR,
          status: noResponseCode,
        };
      }
      token = userData.data.token;
    }
    const testServer = env.NEXT_PUBLIC_BACKEND_TEST;
    const response = await request(testServer)
      .post(url)
      .set("Authorization", `Bearer ${token}`)
      .send(data as object | undefined);

    if (token) {
      await db.session.delete({
        where: {
          token,
        },
      });
    }

    const responseData = response.body as ResponseType<TResponse> | undefined;
    if (!responseData) {
      return {
        success: false,
        message: "No response body received from server",
        errorType: ErrorResponseTypes.NO_RESPONSE_DATA,
        status: response.status,
      };
    }
    if (responseData.success === false) {
      return {
        ...(responseData.data ? { data: responseData.data } : {}),
        success: false,
        message: responseData.message,
        errorType: ErrorResponseTypes.HTTP_ERROR,
        errorCode: response.status,
        status: response.status,
      };
    }
    return {
      data: responseData.data,
      success: true,
      status: response.status,
    };
  } catch (error) {
    // Better error handling
    const typedError =
      error instanceof Error ? error : new Error(String(error));

    throw new Error(
      `Unknow Error executing endpoint test: ${typedError.message}`,
    );
  }
}

const noResponseCode = 0;
