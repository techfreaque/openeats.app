import { testEndpoint } from "@/packages/next-vibe/testing/test-endpoint";
import { expect } from "vitest";

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
