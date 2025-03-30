import type { ApiEndpoint } from "next-query-portal/client/endpoint";
import type { JwtPayloadType } from "next-query-portal/server/endpoints/auth/jwt";
import type { SafeReturnType } from "next-query-portal/server/endpoints/core/api-handler";

/**
 * Options for testing an API endpoint
 */
export interface TestEndpointOptions<
  TRequest,
  TResponse,
  TUrlVariables,
  TExampleKey,
> {
  /**
   * Custom test cases to run in addition to (or instead of) example tests
   */
  customTests?: {
    [testName: string]: (
      test: TestRunner<TRequest, TResponse, TUrlVariables, TExampleKey>,
    ) => Promise<void> | void;
  };

  /**
   * Whether to skip automatic tests based on endpoint examples
   * @default false
   */
  skipExampleTests?: boolean;
}

/**
 * Test runner for executing API endpoint tests
 */
export interface TestRunner<TRequest, TResponse, TUrlVariables, TExampleKey> {
  /**
   * Execute the endpoint with the given data and URL params
   */
  executeWith: (options: {
    data: TRequest;
    urlParams: TUrlVariables;
    user?: JwtPayloadType;
  }) => Promise<SafeReturnType<TResponse> & { status?: number }>;

  /**
   * The endpoint being tested
   */
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>;
}
