import { describe, expect, it } from "vitest";

import type { ApiEndpoint } from "../client/endpoint";
import type { JwtPayloadType } from "../server/endpoints/auth/jwt";
import type { ExamplesList } from "../shared/types/endpoint";
import { sendTestRequest } from "./send-test-request";
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
export function testEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>(
  endpoint: ApiEndpoint<TRequest, TResponse, TUrlVariables, TExampleKey>,
  options: TestEndpointOptions<
    TRequest,
    TResponse,
    TUrlVariables,
    TExampleKey
  > = {},
): void {
  const { customTests = {}, skipExampleTests = false } = options;

  describe(`API: ${endpoint.method} ${endpoint.path.join("/")}`, () => {
    // Create a test runner that can be reused
    const testRunner: TestRunner<
      TRequest,
      TResponse,
      TUrlVariables,
      TExampleKey
    > = {
      endpoint,
      executeWith: async ({ data, urlParams, user }) => {
        return await sendTestRequest<
          TRequest,
          TResponse,
          TUrlVariables,
          TExampleKey
        >({
          endpoint,
          data,
          urlParams,
          user,
        });
      },
    };

    // Run custom tests if provided
    const customTestEntries = Object.entries(customTests) as Array<
      [
        string,
        (
          test: TestRunner<TRequest, TResponse, TUrlVariables, TExampleKey>,
        ) => Promise<void>,
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
    const payloads = endpoint.examples.payloads as
      | ExamplesList<TRequest, TExampleKey>
      | undefined;
    const urlPathVariables = endpoint.examples.urlPathVariables as
      | ExamplesList<TUrlVariables, TExampleKey>
      | undefined;
    if (payloads) {
      describe("Payload Examples", () => {
        // Test each example payload
        const payloadEntries = Object.entries(payloads) as Array<
          ExampleEntry<TRequest>
        >;

        payloadEntries.forEach(([exampleName, payload]) => {
          it(`should handle ${exampleName} example`, async () => {
            const urlParams = urlPathVariables
              ? (urlPathVariables as ExamplesList<TUrlVariables, string>)[
                  exampleName
                ]
              : undefined;

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

    // Test with different user roles if endpoint requires authentication
    if (endpoint.requiresAuthentication() && !skipExampleTests) {
      describe("Authentication & Authorization", () => {
        // Test with unauthorized user
        it("should reject unauthorized users", async () => {
          // Create a user with no roles
          const unauthorizedUser: JwtPayloadType = { id: "unauthorized-user" };

          const exampleKey = payloads
            ? (Object.keys(payloads)[0] as keyof typeof payloads)
            : undefined;
          const response = await testRunner.executeWith({
            data:
              exampleKey && payloads
                ? (payloads[exampleKey] as TRequest)
                : (undefined as unknown as TRequest),
            urlParams:
              exampleKey && urlPathVariables
                ? (urlPathVariables[exampleKey] as TUrlVariables)
                : (undefined as unknown as TUrlVariables),
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
              const exampleKey = payloads
                ? (Object.keys(payloads)[0] as keyof typeof payloads)
                : undefined;
              const response = await testRunner.executeWith({
                data:
                  exampleKey && payloads
                    ? (payloads[exampleKey] as TRequest)
                    : (undefined as unknown as TRequest),
                urlParams:
                  exampleKey && urlPathVariables
                    ? (urlPathVariables[exampleKey] as TUrlVariables)
                    : (undefined as unknown as TUrlVariables),
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
