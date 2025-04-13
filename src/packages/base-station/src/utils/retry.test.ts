import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRetry, makeRetryable, withRetry } from "./retry";

describe("Retry Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("withRetry", () => {
    it("should resolve when the function succeeds", async () => {
      const fn = vi.fn().mockResolvedValue("success");

      const promise = withRetry(fn);
      await expect(promise).resolves.toBe("success");

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry when the function fails", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Retry error"))
        .mockResolvedValueOnce("success");

      const onRetry = vi.fn();
      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        onRetry,
      });

      // Advance timers to trigger retry
      vi.advanceTimersByTime(100);

      await expect(promise).resolves.toBe("success");

      expect(fn).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should reject after max retries", async () => {
      const error = new Error("Persistent error");
      const fn = vi.fn().mockRejectedValue(error);

      const onRetry = vi.fn();
      const promise = withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 100,
        onRetry,
      });

      // Advance timers to trigger all retries
      vi.advanceTimersByTime(100); // First retry
      vi.advanceTimersByTime(200); // Second retry (with backoff)

      await expect(promise).rejects.toThrow("Persistent error");

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(onRetry).toHaveBeenCalledTimes(2);
    });

    it("should apply exponential backoff with jitter", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Retry 1"))
        .mockRejectedValueOnce(new Error("Retry 2"))
        .mockResolvedValueOnce("success");

      const onRetry = vi.fn();
      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffFactor: 2,
        jitter: true,
        onRetry,
      });

      // Advance timers to trigger retries
      vi.advanceTimersByTime(100); // First retry happens after ~100ms (with jitter)
      vi.advanceTimersByTime(200); // Second retry happens after ~200ms (with jitter)

      await expect(promise).resolves.toBe("success");

      expect(fn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);

      // Check that delays were called with increasing values
      const firstDelay = onRetry.mock.calls[0][2];
      const secondDelay = onRetry.mock.calls[1][2];
      expect(secondDelay).toBeGreaterThan(firstDelay);
    });

    it("should respect timeout", async () => {
      const fn = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve("success"), 1000);
        });
      });

      const promise = withRetry(fn, {
        timeout: 500,
      });

      // Advance timers to trigger timeout
      vi.advanceTimersByTime(500);

      await expect(promise).rejects.toThrow("Operation timed out");
    });

    it("should only retry for specified errors", async () => {
      const retryError = new Error("Retry me");
      const nonRetryError = new Error("Don't retry me");

      const fn = vi
        .fn()
        .mockRejectedValueOnce(retryError)
        .mockRejectedValueOnce(nonRetryError);

      // Only retry for "Retry me" errors
      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        retryableErrors: [/Retry me/],
      });

      // Advance timers to trigger retry
      vi.advanceTimersByTime(100);

      await expect(promise).rejects.toThrow("Don't retry me");

      expect(fn).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
  });

  describe("makeRetryable", () => {
    it("should create a retryable version of a function", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Retry"))
        .mockResolvedValueOnce("success");

      const retryableFn = makeRetryable(fn, {
        maxRetries: 2,
        initialDelayMs: 100,
      });

      const promise = retryableFn("arg1", "arg2");

      // Advance timers to trigger retry
      vi.advanceTimersByTime(100);

      await expect(promise).resolves.toBe("success");

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("createRetry", () => {
    it("should create a retry factory with default options", async () => {
      const retry = createRetry({
        maxRetries: 2,
        initialDelayMs: 100,
      });

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Retry"))
        .mockResolvedValueOnce("success");
      const retryableFn = retry(() => fn());

      const promise = retryableFn();

      // Advance timers to trigger retry
      vi.advanceTimersByTime(100);

      await expect(promise).resolves.toBe("success");

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should allow overriding options", async () => {
      const retry = createRetry({
        maxRetries: 1,
        initialDelayMs: 100,
      });

      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Retry 1"))
        .mockRejectedValueOnce(new Error("Retry 2"))
        .mockResolvedValueOnce("success");

      const retryableFn = retry(() => fn(), {
        maxRetries: 2, // Override the default
      });

      const promise = retryableFn();

      // Advance timers to trigger retries
      vi.advanceTimersByTime(100); // First retry
      vi.advanceTimersByTime(100); // Second retry

      await expect(promise).resolves.toBe("success");

      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});
