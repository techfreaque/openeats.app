import logger from '../logging';

interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableErrors?: Array<string | RegExp | RetryableErrorPredicate>;
  jitter?: boolean; // Add randomness to delay to avoid thundering herd
  timeout?: number; // Overall timeout for all retries
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  onMaxAttemptsExceeded?: (error: Error, attempts: number) => void;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onBeforeRetry?: (error: Error, attempt: number, delay: number, cancel: () => void) => void;
  calculateDelay?: (attempt: number, initialDelay: number) => number;
}

// Custom error predicate function
type RetryableErrorPredicate = (error: Error) => boolean;

// Statistics for a retry operation
interface RetryStatistics {
  attempts: number;
  totalTime: number;
  successful: boolean;
  errors: Array<{
    message: string;
    attempt: number;
    timestamp: number;
  }>;
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  jitter: true,
  onRetry: (error, attempt, delay) => {
    logger.warn(`Retrying after error (attempt ${attempt}): ${error.message}, next retry in ${delay}ms`);
  }
};

/**
 * Execute a function with retry capability
 * @param fn Function to execute that returns a promise
 * @param options Retry options
 * @returns Promise that resolves with the function result or rejects after max retries
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let attempt = 0;
  let lastError: Error;
  let cancelled = false;
  const startTime = Date.now();
  const statistics: RetryStatistics = {
    attempts: 0,
    totalTime: 0,
    successful: false,
    errors: []
  };

  // Function to cancel the retry operation
  const cancelRetry = () => {
    cancelled = true;
  };

  // Handle overall timeout
  const overallTimeoutPromise = config.timeout 
    ? new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${config.timeout}ms`));
        }, config.timeout);
      })
    : null;

  while (attempt <= config.maxRetries) {
    try {
      if (attempt > 0) {
        // Calculate delay with exponential backoff or custom calculator
        let delay;
        if (config.calculateDelay) {
          delay = config.calculateDelay(attempt, config.initialDelayMs);
        } else {
          delay = Math.min(
            config.initialDelayMs * Math.pow(config.backoffFactor, attempt - 1),
            config.maxDelayMs || Infinity
          );
          
          // Add jitter to prevent thundering herd problem
          if (config.jitter) {
            // Add/subtract up to 25% randomly
            const jitterFactor = 0.75 + Math.random() * 0.5;
            delay = Math.floor(delay * jitterFactor);
          }
        }
        
        // Call onRetry callback
        if (config.onRetry) {
          config.onRetry(lastError, attempt, delay);
        }

        // Call onBeforeRetry with cancel function
        if (config.onBeforeRetry) {
          config.onBeforeRetry(lastError, attempt, delay, cancelRetry);
          
          if (cancelled) {
            throw new Error('Retry operation cancelled');
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (cancelled) {
          throw new Error('Retry operation cancelled');
        }
      }
      
      // Execute the function, with optional timeout race
      statistics.attempts = attempt + 1;
      const result = overallTimeoutPromise
        ? await Promise.race([fn(), overallTimeoutPromise])
        : await fn();
      
      statistics.totalTime = Date.now() - startTime;
      statistics.successful = true;
      
      // Log success after retries
      if (attempt > 0) {
        logger.info(`Operation succeeded after ${attempt} retries in ${statistics.totalTime}ms`);
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      statistics.errors.push({
        message: lastError.message,
        attempt,
        timestamp: Date.now()
      });

      // Check if we should retry based on the retryCondition
      if (config.retryCondition && !config.retryCondition(lastError, attempt)) {
        statistics.totalTime = Date.now() - startTime;
        logger.debug(`Retry condition returned false: ${lastError.message}`);
        throw lastError; // Don't retry when condition returns false
      }
      
      // Check if error is retryable
      if (config.retryableErrors && config.retryableErrors.length > 0) {
        const isRetryableError = config.retryableErrors.some(pattern => {
          if (typeof pattern === 'string') {
            return lastError.message.includes(pattern) || lastError.name === pattern;
          } else if (pattern instanceof RegExp) {
            return pattern.test(lastError.message) || pattern.test(lastError.name);
          } else if (typeof pattern === 'function') {
            return pattern(lastError);
          }
          return false;
        });
        
        if (!isRetryableError) {
          statistics.totalTime = Date.now() - startTime;
          logger.debug(`Non-retryable error detected: ${lastError.message}`);
          throw lastError; // Don't retry for non-retryable errors
        }
      }
      
      // If this was the last attempt, throw the error
      if (attempt >= config.maxRetries) {
        statistics.totalTime = Date.now() - startTime;
        
        if (config.onMaxAttemptsExceeded) {
          config.onMaxAttemptsExceeded(lastError, attempt + 1);
        }
        
        logger.error(`Max retry attempts (${config.maxRetries}) exceeded. Last error: ${lastError.message}`);
        throw lastError;
      }
      
      attempt++;
    }
  }
  
  // This should never execute because the loop will either return or throw
  throw new Error('Unexpected execution flow in retry logic');
}

/**
 * Create a retry function with default options
 * @param options Default options for all retries
 * @returns A retry function with default options
 */
export function createRetry(options: Partial<RetryOptions>) {
  return <T>(fn: () => Promise<T>, overrideOptions: Partial<RetryOptions> = {}) => {
    return withRetry(fn, { ...options, ...overrideOptions });
  };
}

/**
 * Add retry capability to an existing async function
 * @param fn Function to make retryable
 * @param options Retry options
 * @returns A new function that wraps the original with retry capability
 */
export function makeRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): T {
  const wrapper = ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
  
  // Try to preserve the original function name
  Object.defineProperty(wrapper, 'name', {
    value: `retry_${fn.name}`,
    configurable: true
  });
  
  return wrapper;
}

// Export a retry convenience function
export const retry = makeRetryable;
