import "@testing-library/jest-dom";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.setTimeout and window.clearTimeout
global.setTimeout = vi.fn((fn: () => void) => {
  fn();
  return 1;
}) as unknown as typeof setTimeout;

global.clearTimeout = vi.fn() as unknown as typeof clearTimeout;

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string): string | null => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn((_index: number): string | null => null),
  } as Storage;
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
