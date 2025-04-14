import request from "supertest";

import type { ApiEndpoint } from "../client/endpoint";
import type { JwtPayloadType } from "../server/endpoints/auth/jwt";
import type { ResponseType } from "../shared/types/response.schema";
import { ErrorResponseTypes } from "../shared/types/response.schema";

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
    // In a real implementation, we would create a session for the user
    // This is a placeholder for session creation
    const token = user ? `test-token-${user.id}` : undefined;
    // Use a test server URL (this would be configured in a real environment)
    const testServer = "http://localhost:3000";
    const response = await request(testServer)
      .post(url)
      .set("Authorization", `Bearer ${token}`)
      .send(data as object | undefined);

    // In a real implementation, we would clean up the session here
    // This is a placeholder for session cleanup

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
      `Unknown Error executing endpoint test: ${typedError.message}`,
    );
  }
}
