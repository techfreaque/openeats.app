import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock the global fetch
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
