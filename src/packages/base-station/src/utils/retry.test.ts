import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRetry, retry, withRetry } from "./retry";

describe("Retry Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("withRetry", () => {
    it("should retry on failure and eventually succeed", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("First attempt"))
        .mockResolvedValueOnce("success");

      const onRetry = vi.fn();
      const promise = withRetry(fn, {
        maxRetries: 1,
        initialDelayMs: 100,
        onRetry,
      });

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

    it("should not retry when condition returns false", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Test error"));
      
      // Set up condition that always returns false
      const retryCondition = vi.fn().mockReturnValue(false);
      
      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        retryCondition,
      });
      
      await expect(promise).rejects.toThrow("Test error");
      expect(fn).toHaveBeenCalledTimes(1); // Only the initial call
      expect(retryCondition).toHaveBeenCalledTimes(1);
    });
    
    it("should retry until condition returns false", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Test error"));
      
      // Set up condition that returns true for the first retry, then false
      const retryCondition = vi.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      
      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        retryCondition,
      });
      
      // Advance timers to trigger first retry
      vi.advanceTimersByTime(100);
      
      await expect(promise).rejects.toThrow("Test error");
      expect(fn).toHaveBeenCalledTimes(2); // Initial + 1 retry
      expect(retryCondition).toHaveBeenCalledTimes(2);
    });
    
    it("should support custom onBeforeRetry hook", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockResolvedValueOnce("success");
      
      const onBeforeRetry = vi.fn();
      
      const promise = withRetry(fn, {
        maxRetries: 1,
        initialDelayMs: 100,
        onBeforeRetry,
      });
      
      // Advance timers to trigger retry
      vi.advanceTimersByTime(100);
      
      await expect(promise).resolves.toBe("success");
      expect(onBeforeRetry).toHaveBeenCalledTimes(1);
      expect(onBeforeRetry).toHaveBeenCalledWith(
        expect.any(Error),
        1,
        expect.any(Number)
      );
    });
    
    it("should allow cancelling the retry operation", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Test error"));
      
      let cancelRetry;
      const onBeforeRetry = vi.fn().mockImplementation((error, attempt, delay, cancel) => {
        cancelRetry = cancel;
      });
      
      const promise = withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        onBeforeRetry,
      });
      
      // Advance timers to trigger first retry
      vi.advanceTimersByTime(100);
      
      // Cancel the retry operation
      cancelRetry();
      
      // Advance timers but no more retries should happen
      vi.advanceTimersByTime(1000);
      
      await expect(promise).rejects.toThrow("Retry operation cancelled");
      expect(fn).toHaveBeenCalledTimes(2); // Initial + first retry
    });
  });

  describe("retry factory", () => {
    it("should create a retry wrapper", async () => {
      const retry = createRetry({
        maxRetries: 1,
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
    
    it("should retain the original function name", async () => {
      function testFunction() {
        return Promise.reject(new Error("test"));
      }
      
      const retryableTestFunction = retry(testFunction);
      
      // The wrapper should try to preserve the original function name
      expect(retryableTestFunction.name).toContain("testFunction");
    });
    
    it("should properly forward arguments", async () => {
      const fn = vi.fn().mockImplementation((a, b) => {
        if (fn.mock.calls.length === 1) {
          return Promise.reject(new Error("First call fails"));
        }
        return Promise.resolve(a + b);
      });
      
      const retryableFn = retry(fn);
      
      const promise = retryableFn(5, 7);
      
      // Advance timers to trigger retry
      vi.advanceTimersByTime(100);
      
      await expect(promise).resolves.toBe(12);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith(5, 7);
    });
    
    it("should allow custom retry delay calculation", async () => {
      const customDelayCalculator = vi.fn().mockReturnValue(500); // Always return 500ms
      
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockResolvedValueOnce("success");
      
      const promise = withRetry(fn, {
        maxRetries: 1,
        calculateDelay: customDelayCalculator,
      });
      
      // Advance timers to the custom delay
      vi.advanceTimersByTime(500);
      
      await expect(promise).resolves.toBe("success");
      expect(customDelayCalculator).toHaveBeenCalledTimes(1);
      expect(customDelayCalculator).toHaveBeenCalledWith(1, expect.any(Number));
    });
  });
});
