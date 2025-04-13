import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.setTimeout and window.clearTimeout
global.setTimeout = vi.fn((fn) => {
  fn();
  return 1;
});

global.clearTimeout = vi.fn();

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
