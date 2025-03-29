import { expect } from "vitest";

import { testEndpoint } from "@/packages/next-query-portal/testing/test-endpoint";

import definitions from "./definition";
import { POST } from "./route";

testEndpoint(definitions.POST, POST, {
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
