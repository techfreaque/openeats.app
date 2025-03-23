import { testEndpoint } from "next-query-portal/server";
import { expect } from "vitest";

import { templateEndpoint } from "./definition";
import { POST } from "./route";

testEndpoint(templateEndpoint, POST, {
  customTests: {
    customTest: (response) => {
      expect(response.executeWith()).toBe("This comes from the server");
    },
  },
});
