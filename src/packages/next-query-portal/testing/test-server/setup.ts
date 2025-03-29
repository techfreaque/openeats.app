/* eslint-disable no-console */
import { afterAll, beforeAll } from "vitest";

import { db } from "@/app/api/db";

// Declare globals that will be available to all tests
declare global {
  var testTokens: TestAuthTokens;
  var testBaseUrl: string;
}

// Setup global test database
beforeAll(() => {
  // TODO this should use the data defined in the register definition
  try {
    // Set all tokens in one object for convenience
    global.testTokens = "TODO";
  } catch (error) {
    console.error("Test setup failed check the register endpoint:", error);
    throw error;
  }
});

// Cleanup after tests
afterAll(async () => {
  await db.$disconnect();
});

type TestAuthTokens = {
  [exampleKey: string]: string;
};
