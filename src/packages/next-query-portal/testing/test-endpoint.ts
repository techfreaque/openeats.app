import type { ApiEndpoint } from "next-query-portal/client/endpoint";
import type { JwtPayloadType } from "next-query-portal/server/endpoints/auth/jwt";
import type { ApiHandlerReturnType } from "next-query-portal/server/endpoints/core/api-handler";
import { describe, expect, it } from "vitest";

import { mockExecute } from "./mock-execution";
import type { TestEndpointOptions, TestRunner } from "./types";

/**
 * Type for example entry
 */
type ExampleEntry<T> = [string, T];

/**
 * Generate tests for an API endpoint based on its examples and configuration
 *
 * @example
 * // Simple usage
 * testEndpoint(myEndpoint, myHandler);
 *
 * @example
 * // With custom tests
 * testEndpoint(myEndpoint, myHandler, {
 *   mockUser: { id: 'user1' },
 *   customTests: {
 *     'should reject invalid data': async (test) => {
 *       const response = await test.executeWith({
 *         data: { invalid: 'data' }
 *       });
 *       expect(response.success).toBe(false);
 *     }
 *   }
 * });
 */
export function testEndpoint<TRequest, TResponse, TUrlVariables>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables>,
  handler: ApiHandlerReturnType<TResponse, TUrlVariables>,
  options: TestEndpointOptions<TRequest, TResponse, TUrlVariables> = {},
): void {
  const {
    mockUser = { id: "admin" },
    mockData = {},
    customTests = {},
    skipExampleTests = false,
  } = options;

  describe(`API: ${endpoint.method} ${endpoint.path.join("/")}`, () => {
    // Create a test runner that can be reused
    const testRunner: TestRunner<TRequest, TResponse, TUrlVariables> = {
      endpoint,
      executeWith: async ({ data, urlParams, user = mockUser }) => {
        return mockExecute<TRequest, TResponse, TUrlVariables>({
          endpoint,
          handler,
          data,
          urlParams,
          user,
          mockData,
        });
      },
    };

    // Run custom tests if provided
    const customTestEntries = Object.entries(customTests) as Array<
      [
        string,
        (test: TestRunner<TRequest, TResponse, TUrlVariables>) => Promise<void>,
      ]
    >;

    customTestEntries.forEach(([testName, testFn]) => {
      it(testName, async () => {
        await testFn(testRunner);
      });
    });

    // Skip example tests if requested or if there are no examples
    if (skipExampleTests) {
      return;
    }

    // Group tests for payload examples
    if (endpoint.examples.payloads) {
      describe("Payload Examples", () => {
        // Test each example payload
        const payloadEntries = Object.entries(
          endpoint.examples.payloads,
        ) as Array<ExampleEntry<TRequest>>;

        payloadEntries.forEach(([exampleName, payload]) => {
          it(`should handle ${exampleName} example`, async () => {
            const urlParams = endpoint.examples.urlPathVariables?.default;

            const response = await testRunner.executeWith({
              data: payload,
              urlParams: urlParams as TUrlVariables,
            });

            // Expect success
            expect(response.success).toBe(true);

            // Validate response data against schema
            if (response.success && response.data) {
              const validation = endpoint.responseSchema.safeParse(
                response.data,
              );
              expect(validation.success).toBe(true);
            }
          });
        });
      });
    }

    // Group tests for URL parameter examples
    if (endpoint.examples.urlPathVariables) {
      describe("URL Parameter Examples", () => {
        // Test each example URL parameter
        const urlParamEntries = Object.entries(
          endpoint.examples.urlPathVariables,
        ) as Array<ExampleEntry<TUrlVariables>>;

        urlParamEntries.forEach(([exampleName, urlParams]) => {
          it(`should handle ${exampleName} URL params example`, async () => {
            // Use default payload if available, otherwise undefined
            const payload = endpoint.examples.payloads?.default;

            const response = await testRunner.executeWith({
              data: payload as TRequest,
              urlParams: urlParams,
            });

            // Expect success
            expect(response.success).toBe(true);

            // Validate response data against schema
            if (response.success && response.data) {
              const validation = endpoint.responseSchema.safeParse(
                response.data,
              );
              expect(validation.success).toBe(true);
            }
          });
        });
      });
    }

    // Test with different user roles if endpoint requires authentication
    if (endpoint.requiresAuthentication() && !skipExampleTests) {
      describe("Authentication & Authorization", () => {
        // Test with unauthorized user
        it("should reject unauthorized users", async () => {
          // Create a user with no roles
          const unauthorizedUser: JwtPayloadType = { id: "unauthorized-user" };

          const response = await testRunner.executeWith({
            data: endpoint.examples?.payloads?.default as TRequest,
            urlParams: endpoint.examples?.urlPathVariables
              ?.default as TUrlVariables,
            user: unauthorizedUser,
          });

          // Expect unauthorized response
          expect(response.success).toBe(false);
          expect(response.status).toBeGreaterThanOrEqual(400);
        });

        // Test with valid roles
        if (endpoint.allowedRoles.length > 0) {
          it("should accept users with valid roles", async () => {
            // Use a user with the first allowed role that's not PUBLIC
            const validRoles = endpoint.allowedRoles.filter(
              (role) => role !== "PUBLIC",
            );

            if (validRoles.length > 0) {
              // Test is only relevant if there are non-public roles
              const response = await testRunner.executeWith({
                data: endpoint.examples?.payloads?.default as TRequest,
                urlParams: endpoint.examples?.urlPathVariables
                  ?.default as TUrlVariables,
              });

              // Should succeed with proper authorization
              expect(response.success).toBe(true);
            }
          });
        }
      });
    }
  });
}
