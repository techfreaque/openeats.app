import { testEndpoint } from "next-query-portal/testing/test-endpoint";
import { expect } from "vitest";

import templateEndpoint from "./definition";
import { POST } from "./route";

testEndpoint(templateEndpoint, POST, {
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
