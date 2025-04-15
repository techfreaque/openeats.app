/**
 * Tests for the template API
 */

import { expect } from "vitest";

import { testEndpoint } from "@/packages/next-vibe/testing/test-endpoint";

import definitions from "./definition";

// Test the endpoints using the test-endpoint utility
testEndpoint(definitions.GET);
testEndpoint(definitions.PUT);
testEndpoint(definitions.POST, {
  customTests: {
    "should handle custom parameters": async (test) => {
      const response = await test.executeWith({
        data: { someInputValue: "test" },
        urlParams: {
          someValueFromTheRouteUrl: "test",
        },
        user: { id: "admin" },
      });
      expect(response.success).toBe(true);
    },
  },
});
