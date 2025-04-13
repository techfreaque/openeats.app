import type { ApiEndpoint } from "next-vibe/client/endpoint";
import type { JwtPayloadType } from "next-vibe/server/endpoints/auth/jwt";
import type { ResponseType } from "next-vibe/shared";

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
  }) => Promise<ResponseType<TResponse> & { status?: number }>;

  /**
   * The endpoint being tested
   */
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>;
}
