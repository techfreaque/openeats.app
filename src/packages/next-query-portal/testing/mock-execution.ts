import type { ApiEndpoint } from "next-query-portal/client/endpoint";
import type { JwtPayloadType } from "next-query-portal/server/endpoints/auth/jwt";
import type {
  ApiHandlerReturnType,
  SafeReturnType,
} from "next-query-portal/server/endpoints/core/api-handler";
import { setDataProvider } from "next-query-portal/server/endpoints/data";

import { debugLogger } from "../shared/utils/logger";
import { TestDataProvider } from "./test-data-provider";
import type { MockTestData } from "./types";

/**
 * Execute an API handler directly with mock data
 */
export async function mockExecute<TRequest, TResponse, TUrlVariables>({
  endpoint,
  handler,
  data,
  urlParams,
  user = { id: "admin" },
  mockData = {},
}: {
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>;
  handler: ApiHandlerReturnType<TResponse, TUrlVariables>;
  data?: TRequest;
  urlParams?: TUrlVariables;
  user?: JwtPayloadType;
  mockData?: MockTestData;
}): Promise<SafeReturnType<TResponse> & { status?: number }> {
  // Set up test data provider
  const testDataProvider = new TestDataProvider(mockData);
  setDataProvider(testDataProvider);

  try {
    // Log executing endpoint for debugging
    debugLogger(
      `Executing mock endpoint: ${endpoint.method} ${endpoint.path.join("/")}`,
    );

    // Execute handler with provided data
    const result = await handler({
      data,
      urlParams,
      user,
    });

    return result;
  } catch (error) {
    // Better error handling
    const typedError =
      error instanceof Error ? error : new Error(String(error));

    debugLogger(`Error executing mock endpoint: ${typedError.message}`);

    return {
      success: false,
      message: typedError.message,
      status: 500,
    };
  }
}
